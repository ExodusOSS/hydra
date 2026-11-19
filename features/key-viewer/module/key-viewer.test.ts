import addressProviderDefinition from '@exodus/address-provider/module'
import assetSources from '@exodus/asset-sources'
import type { Atom } from '@exodus/atoms'
import { createInMemoryAtom } from '@exodus/atoms'
import { mnemonicToSeed } from '@exodus/bip39'
import { createAsset as createBitcoin } from '@exodus/bitcoin-plugin'
import KeyIdentifier from '@exodus/key-identifier'
import { getSeedId } from '@exodus/key-utils'
import { Keychain } from '@exodus/keychain'
import { createNoopLogger } from '@exodus/logger'
import { WalletAccount } from '@exodus/models'
import type { IPublicKeyStore } from '@exodus/public-key-provider'
import publicKeyProvider from '@exodus/public-key-provider'

import type { Asset } from './interfaces.js'
import definition from './key-viewer.js'

// Narrow `iter.definitions.find(...)` to the matching `id`'s concrete shape.
// Without this, TS sees the union of *all* definitions in the package and
// requires fields from siblings (e.g. `port` from the atom definition).
// `Id` is constrained to the actual union of definition ids in `iter`, so
// a misspelled id fails to compile rather than fail at runtime.
const getDefinition = <
  Iter extends { definitions: readonly { definition: { id: string } }[] },
  Id extends Iter['definitions'][number]['definition']['id'],
>(
  iter: Iter,
  id: Id
) => {
  const found = iter.definitions.find((d) => d.definition.id === id)
  if (!found) throw new Error(`no definition with id ${id}`)
  return found.definition as Extract<Iter['definitions'][number]['definition'], { id: Id }>
}

const { factory: createKeyViewer } = definition
const { factory: createAddressProvider } = addressProviderDefinition
const { factory: createPublicKeyProvider } = getDefinition(publicKeyProvider(), 'publicKeyProvider')
const { factory: createAssetSources } = getDefinition(assetSources(), 'assetSources')

describe('KeyViewer', async () => {
  const seed = await mnemonicToSeed({
    mnemonic: 'menu memory fury language physical wonder dog valid smart edge decrease worth',
  })
  const seedId = await getSeedId(seed as Buffer)

  let keyViewer: ReturnType<typeof createKeyViewer>
  let assets: Record<string, Asset>
  let walletAccountsAtom: Atom<{ [name: string]: WalletAccount }>

  beforeEach(async () => {
    const bitcoin = createBitcoin({ assetClientInterface: { createLogger: createNoopLogger } })
    assets = {
      bitcoin: { ...bitcoin, baseAsset: bitcoin },
    }

    const walletAccount = new WalletAccount({ ...WalletAccount.DEFAULT, seedId })
    walletAccountsAtom = createInMemoryAtom({
      defaultValue: { [walletAccount.toString()]: walletAccount },
    })

    const keychain = new Keychain({})
    await keychain.unlock(seed)

    const publicKeyStore = { get: jest.fn(), add: jest.fn() }

    const assetsAtom = createInMemoryAtom({ defaultValue: { value: assets } })
    const publicKeyProvider = createPublicKeyProvider({
      walletAccountsAtom,
      keychain,
      logger: createNoopLogger(),
      publicKeyStore: publicKeyStore as unknown as IPublicKeyStore,
      getBuildMetadata: jest.fn().mockResolvedValue({ dev: false }),
      config: {},
      assetsAtom,
    })
    const addressCache = { get: () => {}, set: () => {} }
    const assetSources = createAssetSources({
      assetsAtom,
      availableAssetNamesByWalletAccountAtom: createInMemoryAtom({
        defaultValue: { [walletAccount.toString()]: Object.keys(assets) },
      }),
      walletAccountsAtom,
    })
    const addressProvider = createAddressProvider({
      assetsAtom,
      addressCache,
      publicKeyProvider,
      assetSources,
    })

    keyViewer = createKeyViewer({
      assetsAtom,
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
