import createIOC from '@exodus/argo'
import { createInMemoryAtom } from '@exodus/atoms'
import { createAsset as createBitcoinAsset } from '@exodus/bitcoin-plugin'
import { createGetKeyIdentifier, getSupportedPurposes } from '@exodus/cardano-lib'
import { asset as cardanoMeta } from '@exodus/cardano-meta'
import ethereumPluginCJS from '@exodus/ethereum-plugin'
import { createNoopLogger } from '@exodus/logger'
import { WalletAccount } from '@exodus/models'
import solanaPlugin from '@exodus/solana-plugin'
import { EventEmitter } from 'events' // eslint-disable-line @exodus/restricted-imports/no-node-core-events -- might resolve to Node.js but we are in tests so fine. ts screams at events/events.js

import type assetSourcesApiDefinition from '../api/index.js'
import type { availableAssetNamesByWalletAccountAtomDefinition } from '../atoms/available-asset-names-by-wallet-account.js'
import assetSourcesFeature from '../index.js'
import type { AssetSources } from '../module/asset-sources.js'

// HACK: atm we are native ESM, that module CJS with .default export
// This can be simplified when those are converted to ESM
const ethereumPlugin = ethereumPluginCJS.default || ethereumPluginCJS

const cardano = {
  ...cardanoMeta,
  api: {
    defaultAddressPath: 'm/0/0',
    getSupportedPurposes,
    getKeyIdentifier: createGetKeyIdentifier(),
  },
  get baseAsset() {
    return cardano
  },
}

const assets = {
  bitcoin: {
    ...createBitcoinAsset({ assetClientInterface: {} }),
    get baseAsset() {
      return assets.bitcoin
    },
  },
  cardano,
  ethereum: {
    ...ethereumPlugin.createAsset({ assetClientInterface: {} }),
    get baseAsset() {
      return assets.ethereum
    },
  },
  solana: {
    ...solanaPlugin.createAsset({ assetClientInterface: {} }),
    get baseAsset() {
      return assets.solana
    },
  },
  fakeAssetOnlyLedger: {
    name: 'fakeAssetOnlyLedger',
    baseAssetName: 'fakeAssetOnlyLedger',
    api: {
      features: {
        hardwareWallets: {
          supportMatrix: {
            ledger: { models: ['nanoS'] },
          },
        },
      },
    },
    get baseAsset() {
      return assets.fakeAssetOnlyLedger
    },
  },
  fakeAssetOnlyTrezor: {
    name: 'fakeAssetOnlyTrezor',
    baseAssetName: 'fakeAssetOnlyTrezor',
    api: {
      features: {
        hardwareWallets: {
          supportMatrix: {
            trezor: { models: ['T'] },
          },
        },
      },
    },
    get baseAsset() {
      return assets.fakeAssetOnlyTrezor
    },
  },
}

const walletAccount = new WalletAccount({ ...WalletAccount.DEFAULT, seedId: 'abc' })
const trezorAccount = new WalletAccount({ source: 'trezor', id: '123', model: 'T', index: 0 })
const ledgerAccount = new WalletAccount({ source: 'ledger', id: '123', model: 'nanoS', index: 0 })
const walletAccounts = {
  [walletAccount.toString()]: walletAccount,
  [trezorAccount.toString()]: trezorAccount,
  [ledgerAccount.toString()]: ledgerAccount,
}

describe('asset-sources', () => {
  let assetSources: AssetSources
  let exodus: ReturnType<typeof assetSourcesApiDefinition.factory>
  let availableAssetNamesByWalletAccountAtom: ReturnType<
    typeof availableAssetNamesByWalletAccountAtomDefinition.factory
  >

  beforeEach(() => {
    const ioc = createIOC({ adapters: { createLogger: createNoopLogger } })
      .registerMultiple([
        {
          definition: {
            id: 'assetsAtom',
            factory: () => createInMemoryAtom({ defaultValue: { value: assets } }),
            public: true,
          },
        } as const,
        {
          definition: {
            id: 'walletAccountsAtom',
            factory: () =>
              createInMemoryAtom({
                defaultValue: walletAccounts,
              }),
            public: true,
          },
        } as const,
        {
          definition: {
            id: 'availableAssetNamesAtom',
            factory: () =>
              createInMemoryAtom({
                defaultValue: [
                  'bitcoin',
                  'cardano',
                  'solana',
                  'ethereum',
                  'cdai',
                  'compound',
                  'storj',
                  'fakeAssetOnlyLedger',
                  'fakeAssetOnlyTrezor',
                ],
              }),
            public: true,
          },
        } as const,
        {
          definition: {
            id: 'enabledWalletAccountsAtom',
            factory: () =>
              createInMemoryAtom({
                defaultValue: walletAccounts,
              }),
            public: true,
          },
        } as const,
        {
          definition: {
            id: 'port',
            factory: () => new EventEmitter(),
            public: true,
          },
        } as const,
      ])
      .use(assetSourcesFeature())

    ioc.resolve()
    ;({
      assetSources,
      assetSourcesApi: exodus,
      availableAssetNamesByWalletAccountAtom,
    } = ioc.getAll())
  })

  test('cardano getDefaultPurpose()', async () => {
    await expect(
      assetSources.getDefaultPurpose({
        walletAccount: walletAccount.toString(),
        assetName: 'cardano',
      })
    ).resolves.toEqual(44)

    await expect(
      assetSources.getDefaultPurpose({
        walletAccount: trezorAccount.toString(),
        assetName: 'cardano',
      })
    ).resolves.toEqual(1852)
  })

  test('bitcoin getSupportedPurposes()', async () => {
    await expect(
      assetSources.getSupportedPurposes({
        walletAccount: walletAccount.toString(),
        assetName: 'bitcoin',
      })
    ).resolves.toEqual([84, 86, 44])

    await expect(
      assetSources.getSupportedPurposes({
        walletAccount: trezorAccount.toString(),
        assetName: 'bitcoin',
      })
    ).resolves.toEqual([84, 49])
  })

  test('isSupported()', async () => {
    type InputOutput = [
      assetSource: { assetName: string; walletAccount: string },
      supported: boolean,
    ]

    const expected: InputOutput[] = [
      [{ assetName: 'bitcoin', walletAccount: walletAccount.toString() }, true],
      [{ assetName: 'cardano', walletAccount: walletAccount.toString() }, true],
      [{ assetName: 'solana', walletAccount: walletAccount.toString() }, true],
      [{ assetName: 'bitcoin', walletAccount: trezorAccount.toString() }, true],
      [{ assetName: 'cardano', walletAccount: trezorAccount.toString() }, true],
      [{ assetName: 'solana', walletAccount: trezorAccount.toString() }, false],
      [{ assetName: 'ethereum', walletAccount: trezorAccount.toString() }, true],
    ]

    await Promise.all(
      expected.map(async ([assetSource, supported]) => {
        await expect(assetSources.isSupported(assetSource)).resolves.toEqual(supported)
      })
    )
  })

  test('api', async () => {
    await expect(
      exodus.assetSources.getSupportedPurposes({
        walletAccount: walletAccount.toString(),
        assetName: 'bitcoin',
      })
    ).resolves.toEqual([84, 86, 44])
  })

  describe('availableAssetNamesByWalletAccountAtom', () => {
    it('should return available asset names for wallet accounts', async () => {
      const availableAssetNamesByWalletAccount = await availableAssetNamesByWalletAccountAtom.get()

      expect(availableAssetNamesByWalletAccount).toEqual({
        [walletAccount.toString()]: [
          'bitcoin',
          'cardano',
          'solana',
          'ethereum',
          'cdai',
          'compound',
          'storj',
          'fakeAssetOnlyLedger',
          'fakeAssetOnlyTrezor',
        ],
        [trezorAccount.toString()]: ['bitcoin', 'cardano', 'ethereum', 'fakeAssetOnlyTrezor'],
        [ledgerAccount.toString()]: ['bitcoin', 'ethereum', 'solana', 'fakeAssetOnlyLedger'],
      })
    })
  })
})
