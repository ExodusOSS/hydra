import type { WalletAccount } from '@exodus/models'
import type {
  HardwareWalletDeviceModels,
  HardwareWalletDevice,
  MultisigData,
  SignMessageParams,
} from '@exodus/hw-common'
import type KeyIdentifier from '@exodus/key-identifier'

export interface HardwareSignerProvider {
  isDeviceConnected: () => Promise<boolean>
  scanForDevices: () => Promise<void>
  canAccessAsset: ({ assetName }: CanAccessAssetParams) => Promise<boolean>
  listUseableAssetNames: () => Promise<string[]>
  ensureApplicationIsOpened: ({ assetName }: EnsureApplicationIsOpenedParams) => Promise<void>
  scan: ({ assetName, accountIndexes, addressOffset }: ScanParams) => Promise<ScanResult>
  sync: ({ accountIndex }: SyncParams) => Promise<SyncedKeysId>
  addPublicKeysToWalletAccount: ({
    walletAccount,
    syncedKeysId,
  }: StoreSyncedKeysParams) => Promise<void>
  create: ({ syncedKeysId, isMultisig }: CreateParams) => Promise<WalletAccount>
  signTransaction: ({
    baseAssetName,
    unsignedTx,
    walletAccount,
  }: SignTransactionParams) => Promise<any>
  signMessage: ({ assetName, derivationPath, message }: SignMessageParams) => Promise<any>
}

type Asset = {
  name: string
  baseAsset: Asset
  bip44: number
  api: {
    getKeyIdentifier(params: {
      purpose: number
      accountIndex: number
      chainIndex?: number
      addressIndex?: number
      compatibilityMode?: string
    }): KeyIdentifier
  }
}

export interface CanAccessAssetParams {
  assetName: string
}

export interface EnsureApplicationIsOpenedParams {
  assetName: string
}

export interface GetFirstNAddressesParams {
  assetName: string
  accountIndex: number
  n: number
  offsetBy: number
}

export type GetFirstNAddressesResult = Record<string, any>

export interface ScanParams {
  assetName: string
  accountIndexes: number[]
  addressLimit?: number
  addressOffset: number
}

export type ScannedAccount = {
  accountIndex: number
  addressToBalanceMap: GetFirstNAddressesResult
  mayAlreadyBeSynced: boolean
}
export type ScanResult = ScannedAccount[]

export interface SyncParams {
  accountIndex?: number
  isMultisig?: boolean
}

export type SyncedKeysId = string

export interface SyncedKeysData {
  accountIndex: number
  model: HardwareWalletDeviceModels
  assetNames: Set<string>
  keysToSync: KeyToSyncData[]
}

export type KeyToSyncData = [KeyIdentifier, { xpub?: string; publicKey?: Readonly<Uint8Array> }]

export interface StoreSyncedKeysParams {
  walletAccount: WalletAccount
  syncedKeysId: SyncedKeysId
}

export interface CreateParams {
  syncedKeysId: SyncedKeysId
  isMultisig?: boolean
}

export type GenericSignCallback = ({ device }: { device: HardwareWalletDevice }) => Promise<any>
export interface GenericSignParams {
  baseAssetName: string
  scenario: 'signTransaction' | 'signMessage'
  sign: GenericSignCallback
}

export interface SigningRequestState {
  // An ID for the signing request, so the UI can cancel it if needed
  id: string
  baseAssetName?: string
  scenario: 'signTransaction' | 'signMessage' | 'error'
  error?: Error
}

export interface SigningRequest {
  id: string
  baseAssetName?: string
  sign: GenericSignCallback
  resolve: (result: any) => void
  reject: (error: Error) => void
}

export interface SignTransactionParams {
  baseAssetName: string
  unsignedTx: UnsignedTransaction
  walletAccount: WalletAccount
  multisigData?: MultisigData
}

export interface UnsignedTransaction {
  txData: any
  txMeta: any
}

export interface GetAddressParams {
  assetName: string
  accountIndex: number
  addressIndex: number
  multisigData?: MultisigData
  displayOnDevice?: boolean
}

export interface GetXPUBParams {
  device: HardwareWalletDevice
  baseAsset: Asset
  purpose: number
  accountIndex: number
}

export type GetXPUBResult = {
  keyIdentifier: KeyIdentifier
  xpub: string
}

export interface GetPublicKeyParams {
  device: HardwareWalletDevice
  baseAsset: Asset
  purpose: number
  accountIndex: number
}

export type GetPublicKeyResult = {
  keyIdentifier: KeyIdentifier
  publicKey: Readonly<Uint8Array>
}

export interface FetchBalanceParams {
  asset: any
  address: string
}

export type FetchBalanceResult = any | null

export interface RequireDeviceForParams {
  walletAccount: WalletAccount
}
