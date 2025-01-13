import type { KeyIdentifier } from '@exodus/keychain/module'
import type { MoneroPublicKey, PublicKey, XPUB } from '../serialization/index.js'

export type WalletAccountName = string

interface AddParamsBase {
  walletAccountName: string
  keyIdentifier: KeyIdentifier
}

export interface AddParamsPublicKey extends AddParamsBase {
  publicKey: PublicKey | MoneroPublicKey
}

export interface AddParamsXPUB extends AddParamsBase {
  xpub: XPUB
}
export type AddParams = {
  walletAccountName: string
  keyIdentifier: KeyIdentifier
  publicKey?: PublicKey | MoneroPublicKey
  xpub?: XPUB
}

export interface GetParams {
  walletAccountName: string
  keyIdentifier: KeyIdentifier
}
export type GetReturn = {
  publicKey?: PublicKey | MoneroPublicKey
  xpub?: XPUB
} | null

export interface DeleteParams {
  walletAccountName: string
}

export interface IStorageFormatBuilder {
  list: () => string[]
  add: (params: AddParams) => void
  get: (params: GetParams) => GetReturn
  delete: (params: DeleteParams) => void
}
