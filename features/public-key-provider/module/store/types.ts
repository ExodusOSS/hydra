import type { KeyIdentifier } from '@exodus/keychain/module'
import type { PublicKeyBuffer, MoneroPublicKeyBuffer, XPUB } from './formats/serialization/index.js'
import type { WalletAccount } from '@exodus/models'

export interface AddParams {
  walletAccount: WalletAccount
  keyIdentifier: KeyIdentifier
  publicKey?: PublicKeyBuffer | MoneroPublicKeyBuffer
  xpub?: XPUB
}

export interface GetParams {
  walletAccountName: string
  keyIdentifier: KeyIdentifier
}

export type GetReturn = {
  publicKey?: PublicKeyBuffer | MoneroPublicKeyBuffer
  xpub?: XPUB
} | null

export interface DeleteParams {
  walletAccountName: string
}

export interface IPublicKeyStore {
  add: (params: AddParams) => Promise<void>
  get: (params: GetParams) => Promise<GetReturn>
  delete: (params: DeleteParams) => Promise<void>
  clearSoftwareWalletAccountKeys: () => Promise<void>
}

export interface WalletAccounts<T> {
  getAccounts(): T
  setAccounts(accounts: T): Promise<void>
}
