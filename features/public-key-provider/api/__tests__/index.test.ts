import assetSourcesDefinition from '@exodus/asset-sources/lib/module'
import { createInMemoryAtom } from '@exodus/atoms'
import { createAsset as createBitcoin } from '@exodus/bitcoin-plugin'
import KeyIdentifier from '@exodus/key-identifier'
import { WalletAccount } from '@exodus/models'

import type { PublicKeyProvider } from '../../module/public-key-provider.js'
import publicKeyProviderApiDefinition from '../index.js'

const { factory: createAssetSources } = assetSourcesDefinition
const { factory: createPublicKeyProviderApi } = publicKeyProviderApiDefinition

const assets = {
  bitcoin: {
    ...createBitcoin({ assetClientInterface: {} }),
    get baseAsset() {
      return assets.bitcoin
    },
  },
}

describe('api', () => {
  let publicKeyProvider: PublicKeyProvider
  let api: ReturnType<typeof createPublicKeyProviderApi>['publicKeyProvider']

  beforeEach(() => {
    publicKeyProvider = {
      getPublicKey: jest.fn(),
      getExtendedPublicKey: jest.fn(),
    } as unknown as PublicKeyProvider

    const assetsModule = {
      getAsset: (assetName: keyof typeof assets) => assets[assetName],
    }

    const assetsAtom = createInMemoryAtom({ defaultValue: { value: assets } })
    const walletAccountsAtom = createInMemoryAtom({
      defaultValue: { [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT },
    })

    const availableAssetNamesByWalletAccountAtom = createInMemoryAtom({
      defaultValue: { [WalletAccount.DEFAULT_NAME]: Object.keys(assets) },
    })

    const assetSources = createAssetSources({
      assetsAtom,
      walletAccountsAtom,
      availableAssetNamesByWalletAccountAtom,
    })

    api = createPublicKeyProviderApi({
      publicKeyProvider,
      walletAccountsAtom,
      assetSources,
      assetsModule: assetsModule as never,
    }).publicKeyProvider
  })

  const walletAccount = 'exodus_0'
  const keyIdentifier = new KeyIdentifier({
    assetName: 'bitcoin',
    derivationPath: "m/44'/60'/0'/0/0",
    derivationAlgorithm: 'BIP32',
    keyType: 'secp256k1',
  })

  const defaultBitcoinKeyIdentifier = new KeyIdentifier({
    assetName: 'bitcoin',
    derivationPath: "m/84'/0'/0'/0/0",
    derivationAlgorithm: 'BIP32',
    keyType: 'secp256k1',
  })

  describe('getPublicKey', () => {
    test('passes keyIdentifier and walletAccount on to publicKeyProvider', async () => {
      await api.getPublicKey({ walletAccount, keyIdentifier })

      expect(publicKeyProvider.getPublicKey).toHaveBeenCalledWith({ walletAccount, keyIdentifier })
    })

    test('creates key identifier from wallet account and asset name', async () => {
      await api.getPublicKey({ walletAccount, assetName: 'bitcoin' })

      expect(publicKeyProvider.getPublicKey).toHaveBeenCalledWith({
        walletAccount,
        keyIdentifier: expect.objectContaining(defaultBitcoinKeyIdentifier),
      })
    })
  })

  describe('getExtendendPublicKey', () => {
    test('passes keyIdentifier and walletAccount on to publicKeyProvider', async () => {
      await api.getExtendedPublicKey({ walletAccount, keyIdentifier })

      expect(publicKeyProvider.getExtendedPublicKey).toHaveBeenCalledWith({
        walletAccount,
        keyIdentifier,
      })
    })

    test('creates key identifier from wallet account and asset name', async () => {
      await api.getExtendedPublicKey({ walletAccount, assetName: 'bitcoin' })

      expect(publicKeyProvider.getExtendedPublicKey).toHaveBeenCalledWith({
        walletAccount,
        keyIdentifier: expect.objectContaining(defaultBitcoinKeyIdentifier),
      })
    })
  })
})
