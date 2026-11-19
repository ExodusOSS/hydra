import { createInMemoryAtom } from '@exodus/atoms'
import { SafeError } from '@exodus/errors'

import accountSecurityReportDefinition from '../index.js'

const { factory: createAccountSecurityReport } = accountSecurityReportDefinition

// Mirrors the real plugin contracts (asset.api.securityChecks) closely enough to
// exercise this report's orchestration. The detection logic itself lives in, and
// is tested by, the asset plugins; here we only verify how results are assembled.
const ethereumSecurityChecks = ({ accountState }) => {
  if (accountState?.isBlacklisted) {
    return { isSecure: false, type: 'GLOBAL_SCAM', reason: 'Account is globally blacklisted.' }
  }

  const delegation = accountState?.eip7702Delegation
  if (delegation?.isDelegated && !delegation?.isWhitelisted) {
    return {
      isSecure: false,
      type: 'LOST_PERMISSIONS',
      reason: 'Account is delegated to a non-whitelisted EIP-7702 address.',
    }
  }

  return { isSecure: true, type: null, reason: null }
}

const solanaSecurityChecks = ({ accountState }) =>
  accountState?.ownerChanged
    ? { isSecure: false, type: 'LOST_PERMISSIONS', reason: 'Account owner changed.' }
    : { isSecure: true, type: null, reason: null }

const tronSecurityChecks = ({ accountState }) =>
  accountState?.isBlacklisted
    ? { isSecure: false, type: 'GLOBAL_SCAM', reason: 'Account is globally blacklisted.' }
    : { isSecure: true, type: null, reason: null }

const makeBaseAsset = (name, securityChecks) => ({
  name,
  baseAsset: { name },
  api: securityChecks ? { securityChecks } : {},
})

const assets = {
  ethereum: makeBaseAsset('ethereum', ethereumSecurityChecks),
  solana: makeBaseAsset('solana', solanaSecurityChecks),
  tron: makeBaseAsset('tron', tronSecurityChecks),
  // base asset that does not implement securityChecks -> always ignored
  bitcoin: makeBaseAsset('bitcoin'),
  // securityChecks throws -> must never sink the report
  boom: makeBaseAsset('boom', () => {
    throw new Error('boom')
  }),
  // token (baseAsset.name !== assetName) -> ignored
  usdcoin: {
    name: 'usdcoin',
    baseAsset: { name: 'ethereum' },
    api: { securityChecks: ethereumSecurityChecks },
  },
}

const defaultEnabledAssets = {
  ethereum: true,
  solana: true,
  tron: true,
  bitcoin: true,
  boom: true,
  usdcoin: true,
}

const setup = ({
  accountStates = {},
  enabledAssets = defaultEnabledAssets,
  assets: configuredAssets = assets,
} = {}) =>
  createAccountSecurityReport({
    assetsModule: { getAssets: () => configuredAssets },
    accountStatesAtom: createInMemoryAtom({ defaultValue: { value: accountStates } }),
    enabledAssetsAtom: createInMemoryAtom({ defaultValue: enabledAssets }),
  })

const WALLET_EXISTS = { walletExists: true }

const parse = async (report, args = WALLET_EXISTS) =>
  report.getSchema().parse(await report.export(args))

describe('accountSecurityReport', () => {
  it('should have correct namespace', () => {
    expect(setup().namespace).toEqual('accountSecurity')
  })

  it('should gracefully handle when a wallet does not exist or is locked', async () => {
    const report = setup({
      accountStates: { exodus_0: { tron: { isBlacklisted: true } } },
    })

    expect(await parse(report, { walletExists: false })).toEqual(null)
    expect(await parse(report, { walletExists: true, isLocked: true })).toEqual(null)
  })

  it('should report no warnings when all accounts are secure', async () => {
    const report = setup({
      accountStates: {
        exodus_0: {
          ethereum: { isBlacklisted: false, eip7702Delegation: null },
          solana: { ownerChanged: false },
        },
      },
    })

    expect(await parse(report)).toEqual({
      summary: { warningType: null, hasWarnings: false },
      warnings: [],
      checkFailures: [],
    })
  })

  it('should report a GLOBAL_SCAM warning', async () => {
    const report = setup({
      accountStates: { exodus_0: { tron: { isBlacklisted: true } } },
    })

    expect(await parse(report)).toEqual({
      summary: { warningType: 'GLOBAL_SCAM', hasWarnings: true },
      warnings: [
        {
          walletAccount: 'exodus_0',
          assetName: 'tron',
          type: 'GLOBAL_SCAM',
          reason: 'Account is globally blacklisted.',
        },
      ],
      checkFailures: [],
    })
  })

  it('should report a LOST_PERMISSIONS warning', async () => {
    const report = setup({
      accountStates: { exodus_0: { solana: { ownerChanged: true } } },
    })

    expect(await parse(report)).toEqual({
      summary: { warningType: 'LOST_PERMISSIONS', hasWarnings: true },
      warnings: [
        {
          walletAccount: 'exodus_0',
          assetName: 'solana',
          type: 'LOST_PERMISSIONS',
          reason: 'Account owner changed.',
        },
      ],
      checkFailures: [],
    })
  })

  it('should prioritize GLOBAL_SCAM over LOST_PERMISSIONS in the summary', async () => {
    const report = setup({
      accountStates: {
        exodus_0: {
          solana: { ownerChanged: true },
          tron: { isBlacklisted: true },
        },
      },
    })

    const result = await parse(report)
    expect(result.summary).toEqual({ warningType: 'GLOBAL_SCAM', hasWarnings: true })
    expect(result.checkFailures).toEqual([])
    expect(result.warnings).toHaveLength(2)
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ assetName: 'tron', type: 'GLOBAL_SCAM' }),
        expect.objectContaining({ assetName: 'solana', type: 'LOST_PERMISSIONS' }),
      ])
    )
  })

  it('should detect the EIP-7702 LOST_PERMISSIONS case', async () => {
    const report = setup({
      accountStates: {
        exodus_0: {
          ethereum: { eip7702Delegation: { isDelegated: true, isWhitelisted: false } },
        },
      },
    })

    expect(await parse(report)).toEqual({
      summary: { warningType: 'LOST_PERMISSIONS', hasWarnings: true },
      warnings: [
        {
          walletAccount: 'exodus_0',
          assetName: 'ethereum',
          type: 'LOST_PERMISSIONS',
          reason: 'Account is delegated to a non-whitelisted EIP-7702 address.',
        },
      ],
      checkFailures: [],
    })
  })

  it('should report warnings across multiple wallet accounts', async () => {
    const report = setup({
      accountStates: {
        exodus_0: { tron: { isBlacklisted: true } },
        exodus_1: { solana: { ownerChanged: true } },
      },
    })

    const result = await parse(report)
    expect(result.summary).toEqual({ warningType: 'GLOBAL_SCAM', hasWarnings: true })
    expect(result.checkFailures).toEqual([])
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ walletAccount: 'exodus_0', assetName: 'tron' }),
        expect.objectContaining({ walletAccount: 'exodus_1', assetName: 'solana' }),
      ])
    )
  })

  it('should ignore nullish per-wallet account states', async () => {
    const report = setup({
      accountStates: {
        exodus_0: null,
        exodus_1: { tron: { isBlacklisted: true } },
      },
    })

    expect(await parse(report)).toEqual({
      summary: { warningType: 'GLOBAL_SCAM', hasWarnings: true },
      warnings: [
        {
          walletAccount: 'exodus_1',
          assetName: 'tron',
          type: 'GLOBAL_SCAM',
          reason: 'Account is globally blacklisted.',
        },
      ],
      checkFailures: [],
    })
  })

  it('should ignore base assets that do not implement securityChecks', async () => {
    const report = setup({
      accountStates: { exodus_0: { bitcoin: { isBlacklisted: true } } },
    })

    expect(await parse(report)).toEqual({
      summary: { warningType: null, hasWarnings: false },
      warnings: [],
      checkFailures: [],
    })
  })

  it('should ignore tokens (non-base assets)', async () => {
    const report = setup({
      accountStates: { exodus_0: { usdcoin: { isBlacklisted: true } } },
    })

    expect(await parse(report)).toEqual({
      summary: { warningType: null, hasWarnings: false },
      warnings: [],
      checkFailures: [],
    })
  })

  it('should ignore disabled assets', async () => {
    const report = setup({
      accountStates: { exodus_0: { solana: { ownerChanged: true } } },
      enabledAssets: { ...defaultEnabledAssets, solana: false },
    })

    expect(await parse(report)).toEqual({
      summary: { warningType: null, hasWarnings: false },
      warnings: [],
      checkFailures: [],
    })
  })

  it('should report a throwing securityChecks without sinking the report', async () => {
    const report = setup({
      accountStates: {
        exodus_0: {
          boom: { whatever: true },
          tron: { isBlacklisted: true },
        },
      },
    })

    expect(await parse(report)).toEqual({
      summary: { warningType: 'GLOBAL_SCAM', hasWarnings: true },
      warnings: [
        {
          walletAccount: 'exodus_0',
          assetName: 'tron',
          type: 'GLOBAL_SCAM',
          reason: 'Account is globally blacklisted.',
        },
      ],
      checkFailures: [
        {
          walletAccount: 'exodus_0',
          assetName: 'boom',
          error: expect.any(SafeError),
        },
      ],
    })

    const result = await parse(report)
    expect(result.checkFailures[0].error.hint).toEqual('account-security: report/security-checks')
  })

  it('should report malformed securityChecks results without sinking the report', async () => {
    const report = setup({
      assets: {
        badType: makeBaseAsset('badType', () => ({
          isSecure: false,
          type: 'UNKNOWN_WARNING',
          reason: 'unknown warning type',
        })),
        missingReason: makeBaseAsset('missingReason', () => ({
          isSecure: false,
          type: 'GLOBAL_SCAM',
        })),
        asyncLike: makeBaseAsset('asyncLike', () =>
          Promise.resolve({ isSecure: false, type: 'GLOBAL_SCAM', reason: 'async result' })
        ),
        tron: makeBaseAsset('tron', tronSecurityChecks),
      },
      enabledAssets: {
        badType: true,
        missingReason: true,
        asyncLike: true,
        tron: true,
      },
      accountStates: {
        exodus_0: {
          badType: {},
          missingReason: {},
          asyncLike: {},
          tron: { isBlacklisted: true },
        },
      },
    })

    const result = await parse(report)

    expect(result.summary).toEqual({ warningType: 'GLOBAL_SCAM', hasWarnings: true })
    expect(result.warnings).toEqual([
      {
        walletAccount: 'exodus_0',
        assetName: 'tron',
        type: 'GLOBAL_SCAM',
        reason: 'Account is globally blacklisted.',
      },
    ])
    expect(result.checkFailures).toEqual([
      {
        walletAccount: 'exodus_0',
        assetName: 'badType',
        error: expect.any(SafeError),
      },
      {
        walletAccount: 'exodus_0',
        assetName: 'missingReason',
        error: expect.any(SafeError),
      },
      {
        walletAccount: 'exodus_0',
        assetName: 'asyncLike',
        error: expect.any(SafeError),
      },
    ])
    expect(result.checkFailures.map(({ error }) => error.hint)).toEqual([
      'account-security: report/security-checks',
      'account-security: report/security-checks',
      'account-security: report/security-checks',
    ])
  })

  it('should serialize checkFailures safely for different thrown error shapes', async () => {
    const sensitiveWalletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    const sensitiveSeedPhraseFragment = 'abandon abandon abandon abandon'
    const sensitiveAuthToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    const sensitiveApiKey = 'sk_live_51NfakeSecretValue'
    const sensitiveEmail = 'user@example.com'

    class UnsafeNamedError extends Error {
      name = 'SecretProviderError'
    }

    const codedError = Object.assign(new TypeError(`rpc leaked ${sensitiveAuthToken}`), {
      code: 'EXOD-42',
    })

    const throwingAssets = {
      algorand: makeBaseAsset('algorand', () => {
        throw new Error(`security check included address ${sensitiveWalletAddress}`)
      }),
      cardano: makeBaseAsset('cardano', () => {
        throw codedError
      }),
      monero: makeBaseAsset('monero', () => {
        throw new UnsafeNamedError(
          `security check included seed words ${sensitiveSeedPhraseFragment}`
        )
      }),
      tezos: makeBaseAsset('tezos', () => {
        // eslint-disable-next-line no-throw-literal -- intentionally throwing a non-Error to test handling of string throws
        throw `${sensitiveApiKey} ${sensitiveEmail}`
      }),
    }

    const report = setup({
      assets: throwingAssets,
      enabledAssets: {
        algorand: true,
        cardano: true,
        monero: true,
        tezos: true,
      },
      accountStates: {
        exodus_0: {
          algorand: {},
          cardano: {},
          monero: {},
          tezos: {},
        },
      },
    })

    const result = await parse(report)
    const failures = Object.fromEntries(
      result.checkFailures.map(({ assetName, error, ...failure }) => [
        assetName,
        { ...failure, error: error.toJSON() },
      ])
    )

    expect(result.warnings).toEqual([])
    expect(result.summary).toEqual({ warningType: null, hasWarnings: false })
    expect(failures).toEqual({
      algorand: {
        walletAccount: 'exodus_0',
        error: expect.objectContaining({
          name: 'Error',
          hint: 'account-security: report/security-checks',
          stack: expect.stringContaining('Error: account-security: report/security-checks'),
          timestamp: expect.any(Number),
        }),
      },
      cardano: {
        walletAccount: 'exodus_0',
        error: expect.objectContaining({
          name: 'TypeError',
          code: 'EXOD-42',
          hint: 'account-security: report/security-checks',
          stack: expect.stringContaining('TypeError: EXOD-42'),
          timestamp: expect.any(Number),
        }),
      },
      monero: {
        walletAccount: 'exodus_0',
        error: expect.objectContaining({
          name: 'UnknownError',
          hint: 'account-security: report/security-checks',
          stack: expect.stringContaining('UnknownError: account-security: report/security-checks'),
          timestamp: expect.any(Number),
        }),
      },
      tezos: {
        walletAccount: 'exodus_0',
        error: expect.objectContaining({
          name: 'Error',
          hint: 'account-security: report/security-checks',
          stack: expect.stringContaining('Error: account-security: report/security-checks'),
          timestamp: expect.any(Number),
        }),
      },
    })

    const serializedFailures = JSON.stringify(failures)
    expect(serializedFailures).toContain('account-security: report/security-checks')
    expect(serializedFailures).not.toContain(sensitiveWalletAddress)
    expect(serializedFailures).not.toContain(sensitiveSeedPhraseFragment)
    expect(serializedFailures).not.toContain(sensitiveAuthToken)
    expect(serializedFailures).not.toContain(sensitiveApiKey)
    expect(serializedFailures).not.toContain(sensitiveEmail)
    expect(serializedFailures).not.toContain('SecretProviderError')
  })
})
