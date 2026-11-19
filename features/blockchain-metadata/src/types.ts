import type { Atom, Logger, ReadonlyAtom, Unsubscribe } from '@exodus/atoms'
import type { BaseAsset } from '@exodus/asset-types'
import type { CreateFusionAtomOptions } from '@exodus/fusion-atoms'
import type { AccountState, Tx, TxSet } from '@exodus/models'

export type WalletAccountName = string
export type AssetName = string
export type ISODate = string

export interface JsonObject {
  [key: string]: JsonValue | undefined
}

export type JsonValue = JsonObject | JsonValue[] | string | number | boolean | null | undefined

export interface AssetSource {
  walletAccount: WalletAccountName
  assetName: AssetName
}

export interface AddressAssetSource extends AssetSource {
  address: string
}

export type SerializedTx = ReturnType<TxSet['toJSON']>[number]
export type TxJson = Exclude<Parameters<typeof Tx.fromJSON>[0], string> | SerializedTx
export type TxInput = Tx | TxJson

export interface TxParams extends AssetSource {
  txs: readonly TxInput[]
}

export interface OverwriteTxsParams extends TxParams {
  notifyReceivedTxs?: boolean
}

export type AccountStateData = JsonObject

export interface UpdateAccountStateParams extends AssetSource {
  newData: AccountStateData
}

export type SerializedAccountState = JsonObject

export type TxLogMap = Record<WalletAccountName, Record<AssetName, TxSet>>
export type AccountStateMap = Record<WalletAccountName, Record<AssetName, AccountState>>
export type NewlyReceivedTxLogs = TxLogMap

export interface BlockchainMetadataValue {
  txs: TxLogMap
  accountStates: AccountStateMap
}

export interface BlockchainMetadataAtomValue {
  value: BlockchainMetadataValue
  accountStateChanges?: AccountStateMap
  txLogChanges?: TxLogMap
  newlyReceivedTxLogs?: NewlyReceivedTxLogs
}

export interface TxLogsAtomValue {
  value: TxLogMap
  changes?: TxLogMap
  newlyReceivedTxLogs?: NewlyReceivedTxLogs
}

export interface AccountStatesAtomValue {
  value: AccountStateMap
  changes?: AccountStateMap
}

export interface AccountStateClass {
  create(props?: Record<string, object | JsonValue | undefined>): AccountState
  fromJSON(value: SerializedAccountState): AccountState
  serialize(value: AccountState, options?: { includeMem?: boolean }): SerializedAccountState
}

// Subset of the canonical `BaseAsset` (@exodus/asset-types) that
// blockchain-metadata actually reads — field types track upstream, so renames
// or removals surface as errors here. `baseAsset`/`feeAsset` recurse on the
// same narrow shape (rather than the canonical full `AssetMeta`-bearing
// types) so consumers and test stubs only provide these fields transitively.
export type Asset = Pick<BaseAsset, 'name' | 'currency' | 'isCombined'> & {
  api: Pick<BaseAsset['api'], 'createAccountState' | 'features'>
  baseAsset: Asset
  feeAsset: Asset
}
export type AssetsByName = Record<AssetName, Asset>

// Absent assets are a programmer error; getAsset is intentionally non-optional.
export interface AssetsModule {
  getAsset(assetName: AssetName): Asset
  getAssets(): AssetsByName
}

export interface StorageNamespace<Value> {
  batchGet(keys: readonly string[]): Promise<(Value | undefined)[]>
  clear(): Promise<void>
  set(key: string, value: Value): Promise<void>
}

export interface StoragePort {
  namespace<Value>(name: string): StorageNamespace<Value>
}

export interface ErrorTracking {
  track(payload: { error: unknown; context: JsonObject }): void
}

export type Fusion = CreateFusionAtomOptions<string | undefined>['fusion']

export type WalletAccountsRecord = Record<WalletAccountName, object>

export interface LoadedWalletAccountsPayload {
  walletAccounts: WalletAccountName[]
}

export type EnabledWalletAccountsAtom = ReadonlyAtom<WalletAccountsRecord>
export type BlockchainMetadataAtom = Atom<BlockchainMetadataAtomValue>
export type TxLogsAtom = ReadonlyAtom<TxLogsAtomValue>
export type AccountStatesAtom = ReadonlyAtom<AccountStatesAtomValue>
export type EarliestTxDateAtom = Atom<ISODate | undefined>
export type EnabledAssetsAtom = ReadonlyAtom<Record<AssetName, boolean>>

export interface Analytics {
  requireDefaultEventProperties(
    properties: readonly ['assetSentLast90', 'assetReceivedLast90']
  ): void
  setDefaultEventProperties(payload: {
    assetSentLast90: boolean
    assetReceivedLast90: boolean
  }): void
}

export interface EventPort {
  emit(
    eventName: 'txLogs' | 'accountStates',
    payload:
      | { changes: TxLogMap }
      | { changes: AccountStateMap }
      | { value: TxLogMap }
      | { value: AccountStateMap }
  ): void
}

export interface LifecycleEvent {
  isLocked: boolean
}

export interface ReduxWalletAssetState<Value> {
  error: string | null
  loaded: boolean
  data: Record<AssetName, Value>
}

export type TxLogsReduxState = Record<
  WalletAccountName,
  ReduxWalletAssetState<TxSet> & { hasHistory?: boolean }
>

export type AccountStatesReduxState = Record<
  WalletAccountName,
  ReduxWalletAssetState<AccountState>
> & {
  defaultAccountStates: Record<AssetName, AccountStateData>
}

export interface BatchingChanges {
  accountStates: AccountStateMap
  txLogs: TxLogMap
  newlyReceivedTxLogs: NewlyReceivedTxLogs
}

export interface AccountStateChange extends AssetSource {
  accountState: AccountState
}

export interface TxLogChange extends AssetSource {
  txLog: TxSet
}

export interface BatchingReducerContext {
  getAsset(assetName: AssetName): Asset
  getAssets(): AssetsByName
  getCachedTxLog(assetSource: AssetSource): TxSet | undefined
  getCachedAccountState(assetSource: AssetSource): AccountState | undefined
}

export type BatchingReducer<ActionPayload extends AssetSource = AssetSource> = {
  bivarianceHack(
    changes: BatchingChanges,
    action: { type: symbol; payload: ActionPayload },
    context: BatchingReducerContext
  ): BatchingChanges
}['bivarianceHack']

export interface DeferredPromiseWithState<T> {
  promise: Promise<T>
  resolve(value: T | PromiseLike<T>): void
  reject(reason?: Error | string): void
  started?: boolean
  resolved?: boolean
}

export interface BlockchainMetadata {
  clear(): Promise<void>
  load(): Promise<void>
  sync(): void
  stop(): void
  batch(): Batch
  serializePayload(params: AssetSource & { accountState: AccountState }): {
    assetName: AssetName
    walletAccount: WalletAccountName
    accountState: SerializedAccountState
  }
  getTxLog(params: AssetSource): Promise<TxSet>
  getLoadedTxLogs(): Promise<TxLogMap>
  getLoadedAccountStates(): Promise<AccountStateMap>
  addTxs(params: TxParams): Promise<void>
  updateTxs(params: TxParams): Promise<void>
  removeTxs(params: TxParams): Promise<void>
  overwriteTxs(params: OverwriteTxsParams): Promise<void>
  clearTxs(params: AssetSource): Promise<void>
  getAccountState(params: AssetSource): Promise<AccountState | undefined>
  removeAccountState(params: AssetSource): Promise<void>
  updateAccountState(params: UpdateAccountStateParams): Promise<void>
  /** @deprecated use txLogsAtom, accountStatesAtom or blockchainMetadataAtom instead */
  on(eventName: string, listener: (...args: unknown[]) => void): void
  /** @deprecated use txLogsAtom, accountStatesAtom or blockchainMetadataAtom instead */
  once(eventName: string, listener: (...args: unknown[]) => void): void
}

export interface BlockchainQuery {
  isUsedRecipientAddress(params: AddressAssetSource): Promise<boolean>
}

export interface TxWatcher {
  watch(params: AssetSource & { timeout: number; txId: string }): Promise<Tx>
}

export interface Batch {
  updateAccountState(params: UpdateAccountStateParams): Batch
  removeAccountState(params: AssetSource): Batch
  updateTxs(params: TxParams): Batch
  addTxs(params: TxParams): Batch
  removeTxs(params: TxParams): Batch
  overwriteTxs(params: OverwriteTxsParams): Batch
  clearTxs(params: AssetSource): Batch
  commit(): Promise<void>
}

export type BatchAction =
  | {
      type: symbol
      payload: UpdateAccountStateParams
    }
  | {
      type: symbol
      payload: AssetSource
    }
  | {
      type: symbol
      payload: TxParams
    }
  | {
      type: symbol
      payload: OverwriteTxsParams
    }

export type OnCommit = (actions: readonly BatchAction[]) => Promise<void>

export interface BlockchainMetadataDependencies {
  assetsModule: AssetsModule
  storage: StoragePort
  enabledWalletAccountsAtom: EnabledWalletAccountsAtom
  blockchainMetadataAtom: BlockchainMetadataAtom
  logger: Logger
  errorTracking: ErrorTracking
}

export interface BlockchainQueryDependencies {
  blockchainMetadata: BlockchainMetadata
}

export interface TxWatcherDependencies {
  txLogsAtom: TxLogsAtom
}

export interface BlockchainMetadataApi {
  blockchainMetadata: {
    getTxLog: BlockchainMetadata['getTxLog']
    getLoadedTxLogs: BlockchainMetadata['getLoadedTxLogs']
    addTxs: BlockchainMetadata['addTxs']
    updateTxs: BlockchainMetadata['updateTxs']
    overwriteTxs: BlockchainMetadata['overwriteTxs']
    clearTxs: BlockchainMetadata['clearTxs']
    removeTxs: BlockchainMetadata['removeTxs']
    getAccountState: BlockchainMetadata['getAccountState']
    getLoadedAccountStates: BlockchainMetadata['getLoadedAccountStates']
    updateAccountState: BlockchainMetadata['updateAccountState']
    removeAccountState: BlockchainMetadata['removeAccountState']
    batch: BlockchainMetadata['batch']
    isUsedRecipientAddress: BlockchainQuery['isUsedRecipientAddress']
  }
}

export interface ReportExportParams {
  walletExists?: boolean
  isLocked?: boolean
}

export interface SanitizedTxLog extends JsonObject {
  coinName?: string | null
  send?: boolean | null
}

export type SanitizedTxLogs = Record<WalletAccountName, Record<AssetName, SanitizedTxLog[]>>
export type SanitizedAccountStates = Record<WalletAccountName, Record<AssetName, JsonObject>>

export interface BlockchainMetadataReportValue {
  earliestTxDate?: ISODate
  txLogs: SanitizedTxLogs
  accountStates: SanitizedAccountStates
}

export interface ReportNode {
  namespace: 'blockchainMetadata'
  export(params?: ReportExportParams): Promise<BlockchainMetadataReportValue | null>
  getSchema(): {
    // allow: schema parsers accept unknown input by contract and narrow at the boundary
    parse(value: unknown): BlockchainMetadataReportValue | null
  }
}

export type ObserveTxLogs = (listener: (value: TxLogsAtomValue) => void) => Unsubscribe

export { type AccountState, type TxSet, type Tx } from '@exodus/models'
export { type Logger } from '@exodus/atoms'
