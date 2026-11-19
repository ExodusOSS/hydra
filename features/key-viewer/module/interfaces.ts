import type { WalletAccount, Address } from '@exodus/models'
import type { KeychainApi } from '@exodus/keychain'

export type Asset = any

export interface AddressProvider {
  getDefaultAddress(params: { walletAccount: WalletAccount; assetName: string }): Address
}
export interface Keychain {
  exportKey: KeychainApi['exportKey']
}
