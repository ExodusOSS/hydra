import type { WalletAccount } from '@exodus/models'
import type { HardwareWalletSupportMatrix } from '@exodus/hw-common'

type AssetApiGetSupportedPurposesOpts = {
  walletAccount: WalletAccount
  compatibilityMode?: string
  isMultisig?: boolean
}

type AssetApi = {
  features?: {
    hardwareWallets?: {
      supportMatrix: HardwareWalletSupportMatrix
    }
  }
  getSupportedPurposes?: (opts: AssetApiGetSupportedPurposesOpts) => number[]
}

type BaseAsset = {
  name: string
  // Combined asset may not have an asset api
  api?: AssetApi
  useBip49?: boolean
  useBip84?: boolean
  useBip86?: boolean
}

export type Asset = {
  name: string
  baseAssetName: string
  baseAsset: BaseAsset
}

export type AssetSource = {
  walletAccount: string
  assetName: string
}

export type Assets = {
  [name: string]: Asset
}

export type Port<T> = {
  emit(event: string, value: T): void
}

export type WalletAccounts = { [name: string]: WalletAccount }

export type AvailableAssetNamesByWalletAccount = { [name: string]: string[] }
