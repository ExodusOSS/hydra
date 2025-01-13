import { createInMemoryAtom } from '@exodus/atoms'
import {
  availableAssetNamesAtomDefinition,
  availableAssetsAtomDefinition,
} from '@exodus/available-assets/atoms/index.js'
import { difference } from '@exodus/basic-utils'
import bip44Constants from '@exodus/bip44-constants/by-ticker.js'
import {
  accountStatesAtomDefinition,
  txLogsAtomDefinition,
} from '@exodus/blockchain-metadata/atoms/index.js'
import blockchainMetadataDefinition from '@exodus/blockchain-metadata/module/index.js'
import {
  createGetKeyIdentifier as createCardanoGetKeyIdentifier,
  getSupportedPurposes,
} from '@exodus/cardano-lib'
import { createGetKeyIdentifier } from '@exodus/ethereum-lib'
import { getSeedId } from '@exodus/keychain/module/crypto/seed-id.js'
import { Keychain } from '@exodus/keychain/module/index.js'
import { AccountState, WalletAccount } from '@exodus/models'
import { PublicKeyProvider } from '@exodus/public-key-provider/lib/module/public-key-provider.js'
import publicKeyStoreDefinition from '@exodus/public-key-provider/lib/module/store/index.js'
import createInMemoryStorage from '@exodus/storage-memory'
import createHardwareWalletPublicKeysAtom from '@exodus/wallet-accounts/atoms/hardware-wallet-public-keys.js'
import { enabledWalletAccountsAtomDefinition } from '@exodus/wallet-accounts/atoms/index.js'
import createWalletAccountsAtom from '@exodus/wallet-accounts/atoms/wallet-accounts.js'
import createWalletAccountsInternalAtom from '@exodus/wallet-accounts/atoms/wallet-accounts-internal.js'
import { mnemonicToSeedSync } from 'bip39'

import createAssetClientInterface from '../asset-client-interface.js'

const { factory: createAvailableAssetsAtom } = availableAssetsAtomDefinition
const { factory: createAvailableAssetNamesAtom } = availableAssetNamesAtomDefinition

class DummyAccountState extends AccountState {}

class SolanaAccountState extends AccountState {
  static defaults = {
    foo: 'bar',
    bar: 'snafu',
    cursor: 42,
    mem: { foobar: 'snafu', snafu: 'foobar' },
  }
}

const enabledSolanaTokens = [
  'kinx_solana_bf1442d2',
  'raydium',
  'serum',
  'tetherusd_solana',
  'usdcoin_solana',
]

const assetsMock = {
  algorand: {
    name: 'algorand',
    get baseAsset() {
      return assetsMock.algorand
    },
    api: {
      createAccountState: () => DummyAccountState,
    },
  },
  usdcoin_algorand: {
    name: 'usdcoin_algorand',
    get baseAsset() {
      return assetsMock.algorand
    },
  },
  tetherusd_algorand: {
    name: 'tetherusd_algorand',
    get baseAsset() {
      return assetsMock.algorand
    },
  },
  cardano: {
    name: 'cardano',
    get baseAsset() {
      return assetsMock.cardano
    },
    api: {
      getKeyIdentifier: createCardanoGetKeyIdentifier(),
      createAccountState: () => DummyAccountState,
    },
  },
  ethereum: {
    name: 'ethereum',
    get baseAsset() {
      return assetsMock.ethereum
    },
    api: {
      getKeyIdentifier: createGetKeyIdentifier({
        bip44: bip44Constants.ETH,
        assetName: 'ethereum',
      }),
      createAccountState: () => DummyAccountState,
    },
  },
  tetherusd: {
    name: 'tetherusd',
    get baseAsset() {
      return assetsMock.ethereum
    },
  },
  solana: {
    name: 'solana',
    get baseAsset() {
      return assetsMock.solana
    },
    api: {
      createAccountState: () => SolanaAccountState,
      getKeyIdentifier: createCardanoGetKeyIdentifier(),
    },
  },
  disabled_coin: {
    name: 'disabled_coin',
    get baseAsset() {
      return assetsMock.solana
    },
  },
  ...enabledSolanaTokens.reduce((tokens, name) => {
    tokens[name] = {
      name,
      get baseAsset() {
        return assetsMock.solana
      },
    }

    return tokens
  }, {}),
}

const assetsModule = {
  getAssets: () => assetsMock,
  getAsset: (assetName) => assetsMock[assetName],
}

const trezorAccount = new WalletAccount({
  id: '123',
  source: 'trezor',
  model: 'T',
  index: 0,
})

describe('aci get wallet accounts', () => {
  let assetClientInterface

  beforeEach(async () => {
    const storage = createInMemoryStorage()
    const walletAccountsInternalAtom = createWalletAccountsInternalAtom({ storage })
    const walletAccountsAtom = createWalletAccountsAtom({ walletAccountsInternalAtom })
    const enabledWalletAccountsAtom = enabledWalletAccountsAtomDefinition.factory({
      walletAccountsAtom,
    })

    await walletAccountsInternalAtom.set({
      exodus_0: new WalletAccount({ source: 'exodus', index: 0, seedId: Math.random() }),
      exodus_1: new WalletAccount({ source: 'exodus', index: 1, seedId: Math.random() }),
      exodus_2: new WalletAccount({
        source: 'exodus',
        index: 2,
        enabled: false,
        seedId: Math.random(),
      }),
      trezor: new WalletAccount({
        source: 'trezor',
        id: 'trezor_0_0',
        index: 0,
        enabled: true,
        seedId: Math.random(),
      }),
    })

    const availableAssetsAtom = createAvailableAssetsAtom()
    await availableAssetsAtom.set(
      Object.keys(assetsMock)
        .filter((assetName) => assetName !== 'disabled_coin')
        .map((assetName) => ({ assetName, reason: 'default' }))
    )

    assetClientInterface = createAssetClientInterface({
      blockchainMetadata: {},
      wallet: {},
      walletAccountsAtom,
      enabledWalletAccountsAtom,
      assetsModule,
      availableAssetNamesAtom: createAvailableAssetNamesAtom({ availableAssetsAtom }),
      addressProvider: {
        getReceiveAddress: ({ assetName, walletAccount }) => {
          if (walletAccount.source === 'trezor') {
            throw new Error('address not supported for this asset')
          }

          return 'some-address'
        },
      },
    })
  })

  test('should getWalletAccounts return wallets names for solana', async () => {
    expect(await assetClientInterface.getWalletAccounts({ assetName: 'solana' })).toEqual([
      'exodus_0',
      'exodus_1',
    ])
  })

  test('should getWalletAccounts should return wallets when not a base asset', async () => {
    expect(await assetClientInterface.getWalletAccounts({ assetName: 'usdcoin_solana' })).toEqual([
      'exodus_0',
      'exodus_1',
    ])
  })

  test('should getWalletAccounts raise error when invalid asset name', async () => {
    await expect(assetClientInterface.getWalletAccounts({ assetName: 'invalid' })).rejects.toThrow(
      'invalid is not supported'
    )
  })

  test('getAssetsForNetwork should include assets for solana', async () => {
    const assets = await assetClientInterface.getAssetsForNetwork({ baseAssetName: 'solana' })
    expect(
      difference(
        [
          'solana',
          'kinx_solana_bf1442d2',
          'raydium',
          'serum',
          'tetherusd_solana',
          'usdcoin_solana',
        ],
        Object.keys(assets)
      )
    ).toEqual([])

    expect(assets.disabled_coin).toBeUndefined()
  })

  test('getAssetsForNetwork include assets for ethereum', async () => {
    const assets = await assetClientInterface.getAssetsForNetwork({ baseAssetName: 'ethereum' })
    expect(difference(['ethereum', 'tetherusd'], Object.keys(assets))).toEqual([])
    expect(assets.disabled_coin).toBeUndefined()
  })

  test('getAssetsForNetwork include assets for algorand', async () => {
    const assets = await assetClientInterface.getAssetsForNetwork({ baseAssetName: 'algorand' })
    expect(
      difference(['algorand', 'tetherusd_algorand', 'usdcoin_algorand'], Object.keys(assets))
    ).toEqual([])

    expect(assets.disabled_coin).toBeUndefined()
  })
})

describe('aci get account state', () => {
  let assetClientInterface
  let blockchainMetadata

  beforeEach(async () => {
    const storage = createInMemoryStorage()
    const walletAccountsInternalAtom = createWalletAccountsInternalAtom({ storage })
    const walletAccountsAtom = createWalletAccountsAtom({ walletAccountsInternalAtom })
    const enabledWalletAccountsAtom = enabledWalletAccountsAtomDefinition.factory({
      walletAccountsAtom,
    })

    await walletAccountsInternalAtom.set({
      exodus_0: new WalletAccount({ source: 'exodus', index: 0, seedId: 'some' }),
    })

    const txLogsAtom = txLogsAtomDefinition.factory()
    const accountStatesAtom = accountStatesAtomDefinition.factory()

    const availableAssetsAtom = createAvailableAssetsAtom()
    await availableAssetsAtom.set(
      Object.keys(assetsMock)
        .filter((assetName) => assetName !== 'disabled_coin')
        .map((assetName) => ({ assetName, reason: 'default' }))
    )

    blockchainMetadata = blockchainMetadataDefinition.factory({
      assetsModule,
      storage: createInMemoryStorage(),
      enabledWalletAccountsAtom,
      txLogsAtom,
      accountStatesAtom,
    })
    await blockchainMetadata.load()

    assetClientInterface = createAssetClientInterface({
      assetsModule,
      blockchainMetadata,
      // wallet: {},
      walletAccountsAtom,
      enabledWalletAccountsAtom,
      availableAssetNamesAtom: createAvailableAssetNamesAtom({ availableAssetsAtom }),
    })
  })

  test('should get account state for solana', async () => {
    const accountState = await assetClientInterface.getAccountState({
      assetName: 'solana',
      walletAccount: 'exodus_0',
    })
    expect(accountState).toEqual(assetsMock.solana.api.createAccountState().create())
  })

  test('should update account state for solana', async () => {
    const assetName = 'solana'
    const walletAccount = 'exodus_0'
    const newData = { foo: 'snafu' }

    const accountState = await assetClientInterface.getAccountState({ assetName, walletAccount })
    await assetClientInterface.updateAccountState({ assetName, walletAccount, newData })

    const statePost = await assetClientInterface.getAccountState({ assetName, walletAccount })

    expect({ ...statePost }).toEqual({ ...accountState, ...newData })
  })

  test('should merge account state mem for solana', async () => {
    const assetName = 'solana'
    const walletAccount = 'exodus_0'
    const newData = { mem: { snafu: 'snafu' } }

    const accountState = await assetClientInterface.getAccountState({ assetName, walletAccount })
    await assetClientInterface.updateAccountState({ assetName, walletAccount, newData })

    const statePost = await assetClientInterface.getAccountState({ assetName, walletAccount })

    expect({ ...statePost.mem }).toEqual({ ...accountState.mem, ...newData.mem })
  })
})

describe('getPublicKey', () => {
  const seed = mnemonicToSeedSync(
    'menu memory fury language physical wonder dog valid smart edge decrease worth'
  )
  const seedId = getSeedId(seed)

  const publicKey = '02b0681b906bdb21cc9ef138491b99ab11721fed0757d8375e98724a5154475390'
  const xpub =
    'xpub6H8P7xAy1nvvefMui3rD6yK3cdkBSAhukKRcxeqydPqdm8L8FAvxu33Hgoajcr8PW1oBPDm7sRdPSoUz55kcCF9LNd5RatNgExPrn8Pvd5P'

  let assetClientInterface
  let publicKeyProvider
  let addressProvider

  const walletAccounts = {
    [WalletAccount.DEFAULT]: new WalletAccount({ ...WalletAccount.DEFAULT, seedId }),
    [trezorAccount]: trezorAccount,
  }

  beforeEach(() => {
    const keychain = new Keychain({})
    keychain.addSeed(seed)

    const mockLogger = { warn: jest.fn() }
    const walletAccountsAtom = createInMemoryAtom({
      defaultValue: walletAccounts,
    })

    const storage = createInMemoryStorage()
    storage.set('hardwareWalletPublicKeys', {
      publicKey,
      xpub,
    })
    const hardwareWalletPublicKeysAtom = createHardwareWalletPublicKeysAtom({ storage })
    const softwareWalletPublicKeysAtom = createInMemoryAtom({ defaultValue: Object.create(null) })
    const mockWaletAccounts = {
      setAccounts: (data) => hardwareWalletPublicKeysAtom.set(data),
    }

    const publicKeyStore = publicKeyStoreDefinition.factory({
      logger: mockLogger,
      walletAccounts: mockWaletAccounts,
      hardwareWalletPublicKeysAtom,
      softwareWalletPublicKeysAtom,
    })

    publicKeyProvider = new PublicKeyProvider({
      publicKeyStore,
      keychain,
      walletAccountsAtom,
      getBuildMetadata: jest.fn().mockResolvedValue({ dev: false }),
    })

    addressProvider = {
      getReceiveAddress: ({ assetName, walletAccount }) => {
        if (walletAccount.source === 'trezor') {
          throw new Error('address not supported for this asset')
        }

        return 'some-address'
      },
      getSupportedPurposes: jest.fn(),
    }

    assetClientInterface = createAssetClientInterface({
      assetsModule,
      publicKeyProvider,
      walletAccountsAtom,
      addressProvider,
    })
  })

  test('returns public key', async () => {
    addressProvider.getSupportedPurposes.mockImplementation(async () => [44])

    const key = await assetClientInterface.getPublicKey({
      assetName: 'ethereum',
      walletAccount: WalletAccount.DEFAULT_NAME,
    })

    expect(key.toString('hex')).toBe(
      '020c8da08ca8ef147ea64323e539d791013ff0db4ae9d31c93e29482189af70de5'
    )
  })

  test('returns extended public key', async () => {
    addressProvider.getSupportedPurposes.mockImplementation(async () => [44])

    const key = await assetClientInterface.getExtendedPublicKey({
      assetName: 'ethereum',
      walletAccount: WalletAccount.DEFAULT_NAME,
    })

    expect(key).toBe(xpub)
  })

  test('defaults to the correct purpose', async () => {
    publicKeyProvider.getPublicKey = jest.fn()
    addressProvider.getSupportedPurposes.mockImplementation(async () =>
      getSupportedPurposes({ compatibilityMode: trezorAccount.compatibilityMode })
    )

    await assetClientInterface.getPublicKey({
      assetName: 'cardano',
      walletAccount: trezorAccount.toString(),
    })

    expect(publicKeyProvider.getPublicKey).toHaveBeenCalledWith({
      walletAccount: trezorAccount.toString(),
      keyIdentifier: expect.objectContaining({ derivationPath: "m/1852'/1815'/0'/0/0" }),
    })
  })

  test('defaults to the correct purpose for extended public key', async () => {
    publicKeyProvider.getExtendedPublicKey = jest.fn()
    addressProvider.getSupportedPurposes.mockImplementation(async () =>
      getSupportedPurposes({ compatibilityMode: trezorAccount.compatibilityMode })
    )

    await assetClientInterface.getExtendedPublicKey({
      assetName: 'cardano',
      walletAccount: trezorAccount.toString(),
    })

    expect(publicKeyProvider.getExtendedPublicKey).toHaveBeenCalledWith({
      walletAccount: trezorAccount.toString(),
      keyIdentifier: expect.objectContaining({ derivationPath: "m/1852'/1815'/0'/0/0" }),
    })
  })
})

describe('aci getAssetConfig', () => {
  let _createAssetClientInterface
  let blockchainMetadata

  beforeEach(async () => {
    const storage = createInMemoryStorage()
    const walletAccountsInternalAtom = createWalletAccountsInternalAtom({ storage })
    const walletAccountsAtom = createWalletAccountsAtom({ walletAccountsInternalAtom })
    const enabledWalletAccountsAtom = enabledWalletAccountsAtomDefinition.factory({
      walletAccountsAtom,
    })

    await walletAccountsAtom.set({
      exodus_0: new WalletAccount({
        source: 'exodus',
        index: 0,
        compatibilityMode: 'phantom',
        seedId: 'some',
      }),
    })

    const txLogsAtom = txLogsAtomDefinition.factory()
    const accountStatesAtom = accountStatesAtomDefinition.factory()

    const availableAssetsAtom = createAvailableAssetsAtom()
    await availableAssetsAtom.set(
      Object.keys(assetsMock)
        .filter((assetName) => assetName !== 'disabled_coin')
        .map((assetName) => ({ assetName, reason: 'default' }))
    )

    blockchainMetadata = blockchainMetadataDefinition.factory({
      assetsModule,
      storage: createInMemoryStorage(),
      enabledWalletAccountsAtom,
      txLogsAtom,
      accountStatesAtom,
    })
    await blockchainMetadata.load()

    _createAssetClientInterface = (config) =>
      createAssetClientInterface({
        assetsModule,
        blockchainMetadata,
        // wallet: {},
        walletAccountsAtom,
        enabledWalletAccountsAtom,
        availableAssetNamesAtom: createAvailableAssetNamesAtom({ availableAssetsAtom }),
        config,
      })
  })

  test('should get asset config without account compatibility mode', async () => {
    const assetClientInterface = _createAssetClientInterface()
    const assetConfig = await assetClientInterface.getAssetConfig({
      assetName: 'solana',
      walletAccount: 'exodus_0',
    })
    expect(assetConfig).toEqual({ confirmationsNumber: 1 })

    const assetClientInterface1 = _createAssetClientInterface({
      compatibilityModeGapLimits: { metamask: 5 },
    })
    const assetConfig1 = await assetClientInterface1.getAssetConfig({
      assetName: 'solana',
      walletAccount: 'exodus_0',
    })
    expect(assetConfig1).toEqual({ confirmationsNumber: 1 })
  })

  test('should get asset config with account compatibility mode', async () => {
    const assetClientInterface = _createAssetClientInterface({
      compatibilityModeGapLimits: {
        phantom: 5,
      },
    })
    const assetConfig = await assetClientInterface.getAssetConfig({
      assetName: 'solana',
      walletAccount: 'exodus_0',
    })
    expect(assetConfig).toEqual({ confirmationsNumber: 1, gapLimit: 5 })
  })
})
