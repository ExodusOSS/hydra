import type { WalletAccount } from '@exodus/models'
import type { AddressProvider, Asset, Keychain } from './interfaces.js'
import assert from 'minimalistic-assert'
import { getDefaultPathIndexes } from '@exodus/asset-lib'
import KeyIdentifier from '@exodus/key-identifier'
import type { Atom } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'
import type { AssetSources } from '@exodus/asset-sources'

type Dependencies = {
  keychain: Keychain
  assetSources: AssetSources
  assetsAtom: Atom<{ value: Record<string, Asset> }>
  walletAccountsAtom: Atom<{ [name: string]: WalletAccount }>
  addressProvider: AddressProvider
}

type GetEncodedPrivateKeyParams = {
  baseAssetName: string
  walletAccount: string
}

type PrivateKeyDescriptor = {
  privateKey: string
  address: string
  keyIdentifier: KeyIdentifier
}

type GetEncodedPrivateKeyReturnValue = Promise<[PrivateKeyDescriptor, ...PrivateKeyDescriptor[]]>

export class KeyViewer {
  readonly #keychain: Dependencies['keychain']
  readonly #assetsAtom: Dependencies['assetsAtom']
  readonly #walletAccountsAtom: Dependencies['walletAccountsAtom']
  readonly #addressProvider: Dependencies['addressProvider']
  readonly #assetSources: Dependencies['assetSources']

  constructor({
    keychain,
    assetsAtom,
    walletAccountsAtom,
    addressProvider,
    assetSources,
  }: Dependencies) {
    this.#keychain = keychain
    this.#assetsAtom = assetsAtom
    this.#walletAccountsAtom = walletAccountsAtom
    this.#addressProvider = addressProvider
    this.#assetSources = assetSources
  }

  getEncodedPrivateKeys = async ({
    baseAssetName,
    walletAccount: walletAccountName,
  }: GetEncodedPrivateKeyParams): GetEncodedPrivateKeyReturnValue => {
    const walletAccounts = await this.#walletAccountsAtom.get()
    const walletAccount = walletAccounts[walletAccountName]

    assert(walletAccount, `Wallet account ${walletAccountName} does not exist`)
    assert(
      walletAccount.isSoftware,
      `can only view encoded private key of software wallet accounts, got ${walletAccountName}`
    )

    const { value: assets } = await this.#assetsAtom.get()
    const asset = assets[baseAssetName]
    const purpose = await this.#assetSources.getDefaultPurpose({
      assetName: baseAssetName,
      walletAccount: walletAccountName,
    })
    const { chainIndex, addressIndex } = getDefaultPathIndexes({
      asset,
      walletAccount,
      compatibilityMode: walletAccount.compatibilityMode,
    })

    const keyId = new KeyIdentifier(
      asset.api.getKeyIdentifier({
        purpose,
        accountIndex: walletAccount.index,
        chainIndex,
        addressIndex,
        compatibilityMode: walletAccount.compatibilityMode,
      })
    )

    const keyExport = this.#keychain.exportKey({
      seedId: walletAccount.seedId!,
      keyId,
      exportPrivate: true,
      exportPublic: false,
    })

    const addressExport = this.#addressProvider.getDefaultAddress({
      walletAccount,
      assetName: baseAssetName,
    })

    const [{ privateKey }, address] = await Promise.all([keyExport, addressExport])

    const encodedPrivateKey = asset.keys?.encodePrivate
      ? asset.keys.encodePrivate(privateKey)
      : privateKey.toString('hex')

    return [
      {
        privateKey: encodedPrivateKey,
        keyIdentifier: keyId,
        address: address.toString(),
      },
    ]
  }
}

const createKeyViewer = (opts: Dependencies) => new KeyViewer(opts)

const keyViewerDefinition = {
  id: 'keyViewer',
  type: 'module',
  factory: createKeyViewer,
  dependencies: ['keychain', 'assetsAtom', 'walletAccountsAtom', 'addressProvider', 'assetSources'],
} as const satisfies Definition

export default keyViewerDefinition
