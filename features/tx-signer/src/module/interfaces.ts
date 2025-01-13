import type { WalletAccount } from '@exodus/models'
import type { KeyIdentifier } from '@exodus/keychain/module'

export interface ISignedTransaction {
  rawTx: Buffer
}
export interface ITransactionSigner {
  signTransaction: (params: SignTransactionParams) => Promise<ISignedTransaction>
}

export interface InternalSignTransactionParams {
  baseAssetName: string
  unsignedTx: UnsignedTransaction
  walletAccount: WalletAccount
}

export interface InternalSigner {
  signTransaction: (params: InternalSignTransactionParams) => Promise<ISignedTransaction>
}

export interface HardwareSignerProvider {
  requireDeviceFor: (walletAccount: WalletAccount) => Promise<InternalSigner>
}

export interface SignTransactionParams {
  baseAssetName: string
  unsignedTx: UnsignedTransaction
  walletAccount: WalletAccount
}

export interface UnsignedTransaction {
  txData: any
  txMeta: any
}

export interface Asset {
  name: string
  useMultipleAddresses?: boolean
  baseAsset: Asset
  api: {
    features: { [x: string]: any }
    getKeyIdentifier: (options: {
      purpose: number
      accountIndex: number
      addressIndex?: number
      chainIndex?: number
      compatibilityMode?: string
    }) => KeyIdentifier
    signTx?: AssetSignTx
  }
}

export interface KeychainSignerParams {
  data: Buffer
  enc?: string
  keyId?: KeyIdentifier
  signatureType?: string
  tweak?: Buffer
  extraEntropy?: Buffer
}

export interface GetPublicKeyParams {
  keyId?: KeyIdentifier
}

export interface AssetSignTxParams {
  unsignedTx: UnsignedTransaction
  privateKey?: Buffer
  signer?: Signer
}

export type AssetSignTx = (params: AssetSignTxParams) => Promise<any>

export interface AssetsModule {
  getAsset: (assetName: string) => Asset
}
export interface Signer {
  sign: (params: KeychainSignerParams) => Promise<any>
  getPublicKey: (params?: GetPublicKeyParams) => Promise<Buffer>
}
