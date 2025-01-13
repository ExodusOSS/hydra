import type { WalletAccount, Address } from '@exodus/models'
import type KeyIdentifier from '@exodus/key-identifier'

export type Asset = any

export interface AssetsModule {
  getAsset(name: string): Asset
}

export interface AddressProvider {
  getDefaultAddress(params: { walletAccount: WalletAccount; assetName: string }): Address
}

type SeedId = string
type KeySource = { seedId: SeedId; keyId: KeyIdentifier }

type PublicKeys = {
  publicKey: Buffer
  xpub: string
}

type PrivateKeys = {
  privateKey: Buffer
  xpriv: string
}

export interface Keychain {
  exportKey(params: KeySource): PromiseLike<PublicKeys>
  exportKey(params: { exportPrivate: false } & KeySource): PromiseLike<PublicKeys>
  exportKey(params: { exportPrivate: true } & KeySource): PromiseLike<PublicKeys & PrivateKeys>
}
