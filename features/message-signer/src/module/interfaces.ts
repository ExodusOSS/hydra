import type { WalletAccount } from '@exodus/models'
import type { KeyIdentifier } from '@exodus/keychain/module'
import type { HardwareWalletDevice } from '@exodus/hw-common'

export type Bytes = Readonly<Uint8Array>

export type Purpose = number

export type IUnsignedMessage = {
  rawMessage?: Bytes
} & Record<string, any>

export type ISignedMessage = Buffer | Record<string, any>

export interface IMessageSigner {
  signMessage: (params: SignMessageParams) => Promise<ISignedMessage>
}

export interface InternalSignMessageParams {
  baseAssetName: string
  walletAccount: WalletAccount
  purpose?: Purpose
  message: IUnsignedMessage
}

export interface InternalSigner {
  signMessage: (params: InternalSignMessageParams) => Promise<ISignedMessage>
}

export interface HardwareSignerProvider {
  requireDeviceFor: (walletAccount: WalletAccount) => Promise<HardwareWalletDevice<any>>
}

export interface SignMessageParams {
  baseAssetName: string
  walletAccount: WalletAccount | string
  purpose?: Purpose
  message: IUnsignedMessage
}

interface Asset {
  name: string
  useMultipleAddresses?: boolean
  api: {
    features: { [x: string]: boolean }
    getKeyIdentifier: (options: {
      purpose: number
      accountIndex: number
      addressIndex?: number
      chainIndex?: number
      compatibilityMode?: string
    }) => KeyIdentifier
    signMessage?: (options: { privateKey: Bytes; message: IUnsignedMessage }) => ISignedMessage
  }
}

export interface AssetsModule {
  getAsset: (assetName: string) => Asset
}

export interface AddressProvider {
  getSupportedPurposes(params: {
    assetName: string
    walletAccount: WalletAccount
  }): Promise<number[]>
}
