import { WalletAccount } from '@exodus/models'
import createInMemoryStorage from '@exodus/storage-memory'

import preferExodusDerivationMigration, {
  DERIVATION_REPAIR_FLAG,
} from '../migrations/prefer-exodus-derivation.js'

const { factory: migrate } = preferExodusDerivationMigration

const seedId = 'c3d6347aa044325cbad76c524f1b3cacda024c3c'

const walletAccountJSON = (overrides: Record<string, unknown> = {}) => ({
  source: WalletAccount.EXODUS_SRC,
  index: 0,
  label: 'Wallet 1',
  enabled: true,
  seedId,
  compatibilityMode: 'phantom',
  ...overrides,
})

describe('prefer-exodus-derivation migration', () => {
  let storage: ReturnType<typeof createInMemoryStorage>
  let walletAccountsStorage: ReturnType<typeof createInMemoryStorage>
  let hasExodusHistory: jest.Mock
  let modules: Parameters<typeof migrate>[0]['modules']

  const setup = async (walletAccounts?: Record<string, unknown>) => {
    storage = createInMemoryStorage()
    walletAccountsStorage = storage.namespace('walletAccounts')
    if (walletAccounts) await walletAccountsStorage.set('walletAccounts', walletAccounts)

    hasExodusHistory = jest.fn().mockResolvedValue(true)
    modules = {
      wallet: { getPrimarySeedId: async () => seedId },
      keychain: {},
      walletCompatibilityModes: {
        supports: (mode: string) => ['phantom', 'metamask', 'trust'].includes(mode),
        hasExodusHistory,
      },
    }
  }

  const run = async () =>
    migrate({ adapters: { storage, unsafeStorage: storage }, modules } as never)

  const reloadFlag = async () => walletAccountsStorage.get(DERIVATION_REPAIR_FLAG)

  const storedAccounts = async () =>
    (await walletAccountsStorage.get('walletAccounts')) as Record<
      string,
      Record<string, unknown>
    > | null

  test('clears the mode on every exodus account when exodus history exists', async () => {
    await setup({
      exodus_0: walletAccountJSON(),
      exodus_1: walletAccountJSON({ index: 1, label: 'Wallet 2' }),
    })

    await run()

    expect(hasExodusHistory).toHaveBeenCalledWith({ mode: 'phantom', keychain: {}, seedId })
    const accounts = await storedAccounts()
    expect(accounts!.exodus_0!.compatibilityMode).toBeUndefined()
    expect(accounts!.exodus_1!.compatibilityMode).toBeUndefined()
    expect(accounts!.exodus_1!.label).toBe('Wallet 2')
    await expect(reloadFlag()).resolves.toBe(true)
  })

  test('leaves a genuine third-party wallet alone', async () => {
    await setup({ exodus_0: walletAccountJSON() })
    hasExodusHistory.mockResolvedValue(false)

    await run()

    expect((await storedAccounts())!.exodus_0!.compatibilityMode).toBe('phantom')
    await expect(reloadFlag()).resolves.toBeUndefined()
  })

  test('skips a wallet with no compatibility mode without probing', async () => {
    await setup({ exodus_0: walletAccountJSON({ compatibilityMode: undefined }) })

    await run()

    expect(hasExodusHistory).not.toHaveBeenCalled()
  })

  test('skips an unsupported stored mode', async () => {
    await setup({ exodus_0: walletAccountJSON({ compatibilityMode: 'ledger' }) })

    await run()

    expect(hasExodusHistory).not.toHaveBeenCalled()
    expect((await storedAccounts())!.exodus_0!.compatibilityMode).toBe('ledger')
  })

  test('skips when nothing is stored yet', async () => {
    await setup()

    await expect(run()).resolves.toBeUndefined()
    expect(hasExodusHistory).not.toHaveBeenCalled()
  })

  test('leaves non-exodus accounts untouched', async () => {
    await setup({
      exodus_0: walletAccountJSON(),
      [`seed_0_${seedId}_phantom`]: walletAccountJSON({
        source: WalletAccount.SEED_SRC,
        label: 'Imported',
      }),
    })

    await run()

    const accounts = await storedAccounts()
    expect(accounts!.exodus_0!.compatibilityMode).toBeUndefined()
    expect(accounts![`seed_0_${seedId}_phantom`]!.compatibilityMode).toBe('phantom')
  })

  test('rejects when the probe fails so the migration is retried', async () => {
    await setup({ exodus_0: walletAccountJSON() })
    hasExodusHistory.mockRejectedValue(new Error('network unreachable'))

    await expect(run()).rejects.toThrow('network unreachable')
    expect((await storedAccounts())!.exodus_0!.compatibilityMode).toBe('phantom')
    await expect(reloadFlag()).resolves.toBeUndefined()
  })

  test('rejects when the probe never settles', async () => {
    await setup({ exodus_0: walletAccountJSON() })
    hasExodusHistory.mockReturnValue(new Promise(() => {}))
    jest.useFakeTimers()

    const migrated = run()
    await jest.advanceTimersByTimeAsync(4000)

    await expect(migrated).rejects.toThrow('hasExodusHistory timed out')
    jest.useRealTimers()
  })
})
