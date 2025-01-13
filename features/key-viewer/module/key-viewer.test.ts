import addressProviderDefinition from '@exodus/address-provider/module'
import assetSourcesDefinition from '@exodus/asset-sources/lib/module'
import type { Atom } from '@exodus/atoms'
import { createInMemoryAtom } from '@exodus/atoms'
import { createAsset as createBitcoin } from '@exodus/bitcoin-plugin'
import KeyIdentifier from '@exodus/key-identifier'
import { getSeedId } from '@exodus/key-utils'
import { Keychain } from '@exodus/keychain/module'
import { createNoopLogger } from '@exodus/logger'
import { WalletAccount } from '@exodus/models'
import type { IPublicKeyStore } from '@exodus/public-key-provider'
import publicKeyProviderDefinition from '@exodus/public-key-provider/lib/module'
import { mnemonicToSeedSync } from 'bip39'

import type { Asset } from './interfaces.js'
import definition from './key-viewer.js'

const { factory: createKeyViewer } = definition
const { factory: createAddressProvider } = addressProviderDefinition
const { factory: createPublicKeyProvider } = publicKeyProviderDefinition
const { factory: createAssetSources } = assetSourcesDefinition

describe('KeyViewer', () => {
  const seed = mnemonicToSeedSync(
    'menu memory fury language physical wonder dog valid smart edge decrease worth'
  )
  const seedId = getSeedId(seed)

  let keyViewer: ReturnType<typeof createKeyViewer>
  let assets: Record<string, Asset>
  let walletAccountsAtom: Atom<{ [name: string]: WalletAccount }>

  beforeEach(() => {
    const bitcoin = createBitcoin({ assetClientInterface: {} })
    assets = {
      bitcoin: { ...bitcoin, baseAsset: bitcoin },
    }

    const walletAccount = new WalletAccount({ ...WalletAccount.DEFAULT, seedId })
    walletAccountsAtom = createInMemoryAtom({
      defaultValue: { [walletAccount.toString()]: walletAccount },
    })

    const assetsModule = { getAsset: (name: string) => assets[name] }
    const keychain = new Keychain({})
    keychain.addSeed(seed)

    const publicKeyStore = { get: jest.fn(), add: jest.fn() }

    const publicKeyProvider = createPublicKeyProvider({
      walletAccountsAtom,
      keychain,
      logger: createNoopLogger(),
      publicKeyStore: publicKeyStore as unknown as IPublicKeyStore,
      getBuildMetadata: jest.fn().mockResolvedValue({ dev: false }),
    })
    const addressCache = { get: () => {}, set: () => {} }
    const assetSources = createAssetSources({
      assetsAtom: createInMemoryAtom({ defaultValue: { value: assets } }),
      availableAssetNamesByWalletAccountAtom: createInMemoryAtom({
        defaultValue: { [walletAccount.toString()]: Object.keys(assets) },
      }),
      walletAccountsAtom,
    })
    const addressProvider = createAddressProvider({
      assetsModule,
      addressCache,
      publicKeyProvider,
      assetSources,
    })

    keyViewer = createKeyViewer({
      assetsModule,
      keychain,
      walletAccountsAtom,
      addressProvider,
      assetSources,
    })
  })

  test('returns encoded key for default wallet account', async () => {
    const [key] = await keyViewer.getEncodedPrivateKeys({
      baseAssetName: 'bitcoin',
      walletAccount: WalletAccount.DEFAULT_NAME,
    })

    expect(key).toEqual({
      privateKey: 'L5eMBYcD3ZevgVgWcVXaFdGevADdXf3ai2Q2cys786AK2TPdVqkU',
      address: 'bc1qlrh635rpvps06d9klakf7k3lq4tlnd25e53pez',
      keyIdentifier: new KeyIdentifier({
        assetName: 'bitcoin',
        derivationAlgorithm: 'BIP32',
        derivationPath: "m/84'/0'/0'/0/0",
        keyType: 'secp256k1',
      }),
    })
  })

  test("falls back to buffer.toString('hex') for assets without encodePrivate", async () => {
    delete assets.bitcoin.keys.encodePrivate

    const [key] = await keyViewer.getEncodedPrivateKeys({
      baseAssetName: 'bitcoin',
      walletAccount: WalletAccount.DEFAULT_NAME,
    })

    expect(key).toEqual({
      privateKey: 'fb5fb4012409ba5bcaa29faf3ce3929f0cb14d2ff1f91885761c48f39996b4b3',
      address: 'bc1qlrh635rpvps06d9klakf7k3lq4tlnd25e53pez',
      keyIdentifier: new KeyIdentifier({
        assetName: 'bitcoin',
        derivationAlgorithm: 'BIP32',
        derivationPath: "m/84'/0'/0'/0/0",
        keyType: 'secp256k1',
      }),
    })
  })

  test('throws when not called with software wallet account', async () => {
    const trezorAccount = new WalletAccount({
      source: WalletAccount.TREZOR_SRC,
      index: 0,
      id: 'abc',
    })

    await walletAccountsAtom.set({ [trezorAccount.toString()]: trezorAccount })

    await expect(
      keyViewer.getEncodedPrivateKeys({
        baseAssetName: 'bitcoin',
        walletAccount: trezorAccount.toString(),
      })
    ).rejects.toThrow(/only view encoded private key of software/)
  })
})
