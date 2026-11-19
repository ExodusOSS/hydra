import type { Definition } from '@exodus/dependency-types'
import { TxSet, normalizeTxsJSON } from '@exodus/models'
import EventEmitter from 'events/events.js'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import proxyFreeze from '@exodus/proxy-freeze'
import { Batch, getReducer } from './batching/index.js'
import pDefer from 'p-defer'
import { flattenToPaths, set } from '@exodus/basic-utils'
import type {
  AccountState,
  AccountStateClass,
  AccountStateChange,
  AccountStateMap,
  Asset,
  AssetSource,
  AssetsByName,
  BatchAction,
  BatchingChanges,
  BlockchainMetadata,
  BlockchainMetadataAtom,
  BlockchainMetadataAtomValue,
  BlockchainMetadataDependencies,
  DeferredPromiseWithState,
  WalletAccountsRecord,
  LoadedWalletAccountsPayload,
  NewlyReceivedTxLogs,
  SerializedAccountState,
  StorageNamespace,
  TxJson,
  TxLogChange,
  TxLogMap,
  TxParams,
  OverwriteTxsParams,
  UpdateAccountStateParams,
} from '../types.js'

const { isEmpty, zipObject } = lodash

const stringifyAssetSource = ({ assetName, walletAccount }: AssetSource): string =>
  `${walletAccount}:${assetName}`

const toChangesArray = <Key extends string, Value>(
  byAssetSource: Record<string, Record<string, Value>>,
  key: Key
): (AssetSource & Record<Key, Value>)[] =>
  // allow: cast; flattenToPaths is dynamically typed
  (flattenToPaths(byAssetSource) as [string, string, Value][]).map(
    ([walletAccount, assetName, data]) =>
      ({ walletAccount, assetName, [key]: data }) as AssetSource & Record<Key, Value>
  )

const toTxLogChangesArray = (byAssetSource: TxLogMap): TxLogChange[] =>
  toChangesArray(byAssetSource, 'txLog')
const toAccountStateChangesArray = (byAssetSource: AccountStateMap): AccountStateChange[] =>
  toChangesArray(byAssetSource, 'accountState')
const changesArrayToObject = (
  changes: readonly {
    walletAccount: string
    assetName: string
    txLog?: TxSet
    accountState?: AccountState
  }[]
): Record<string, Record<string, TxSet | AccountState>> => {
  const result: Record<string, Record<string, TxSet | AccountState>> = {}
  for (const { walletAccount, assetName, txLog, accountState } of changes) {
    set(result, [walletAccount, assetName], txLog || accountState) // pretty hacky
  }

  return result
}

const cloneAssetSourceData = <Value>(
  data: Record<string, Record<string, Value>>
): Record<string, Record<string, Value>> =>
  Object.fromEntries(
    Object.entries(data).map(([walletAccount, valuesByAssetName]) => [
      walletAccount,
      Object.fromEntries(Object.entries(valuesByAssetName)),
    ])
  )

const createLoadedDeferred = (): DeferredPromiseWithState<void> =>
  Object.assign(pDefer<void>(), { started: false, resolved: false })

// allow: cast; Object.create is typed as any, this is the single typed boundary for the null-prototype maps
const createNullPrototypeObject = <T extends object>(): T => Object.create(null) as T

class BlockchainMetadataImpl extends EventEmitter implements BlockchainMetadata {
  #txs: TxLogMap
  #blockchainMetadataAtom: BlockchainMetadataAtom
  #txsStorage: StorageNamespace<TxJson[]>
  #accountStates: AccountStateMap
  #accountStatesStorage: StorageNamespace<SerializedAccountState>
  #walletAccountsPayload: LoadedWalletAccountsPayload | undefined
  #assetsModule: BlockchainMetadataDependencies['assetsModule']
  #enabledWalletAccountsAtom: BlockchainMetadataDependencies['enabledWalletAccountsAtom']
  #loaded: DeferredPromiseWithState<void> = createLoadedDeferred()
  #subscriptions: (() => void)[] = []
  #logger: BlockchainMetadataDependencies['logger']
  #errorTracking: BlockchainMetadataDependencies['errorTracking']

  constructor({
    assetsModule,
    storage,
    enabledWalletAccountsAtom,
    blockchainMetadataAtom,
    logger,
    errorTracking,
  }: BlockchainMetadataDependencies) {
    super()

    this.#txs = proxyFreeze(createNullPrototypeObject<TxLogMap>())
    this.#accountStates = proxyFreeze(createNullPrototypeObject<AccountStateMap>())
    this.#enabledWalletAccountsAtom = enabledWalletAccountsAtom
    this.#blockchainMetadataAtom = blockchainMetadataAtom
    this.#assetsModule = assetsModule
    this.#txsStorage = storage.namespace('txs')
    this.#accountStatesStorage = storage.namespace('states')
    this.#logger = logger
    this.#errorTracking = errorTracking
  }

  emit = (name: string, ...args: (object | string | number | boolean | null | undefined)[]) => {
    const isFreezable = (val: object | string | number | boolean | null | undefined) =>
      val && typeof val === 'object'
    return super.emit(name, ...args.map((arg) => (isFreezable(arg) ? proxyFreeze(arg) : arg)))
  }

  load = async () => {
    if (this.#loaded.started) return

    this.#loaded.started = true

    this.#subscriptions.push(this.#enabledWalletAccountsAtom.observe(this.#load))
  }

  #load = async (walletAccounts: WalletAccountsRecord) => {
    const walletAccountNames = Object.keys(walletAccounts)
    await Promise.all(
      walletAccountNames.map((name) => this.#loadWalletAccount({ walletAccount: name }))
    )

    this.#walletAccountsPayload = {
      walletAccounts: walletAccountNames,
    }

    // @deprecated
    this.emit('load-wallet-accounts', this.#walletAccountsPayload)

    this.#loaded.resolve()
    if (!this.#loaded.resolved) {
      this.#loaded.resolved = true
      await this.#setCachedBlockchainMetadata()
    }
  }

  // @deprecated
  sync = () => {
    this.emit('load-wallet-accounts', this.#walletAccountsPayload)
  }

  serializePayload({
    assetName,
    walletAccount,
    accountState,
  }: AssetSource & { accountState: AccountState }) {
    const AccountState = this.#createAccountStateClass(assetName)
    const serialized = AccountState!.serialize(accountState, { includeMem: true })
    return { assetName, walletAccount, accountState: serialized }
  }

  #getAsset = (assetName: string): Asset => this.#assetsModule.getAsset(assetName)

  #getAssets = (): AssetsByName => this.#assetsModule.getAssets()

  #createAccountStateClass = (assetName: string): AccountStateClass | undefined =>
    // `!`: createAccountState is optional in the canonical AssetApi, but the
    // original called it unconditionally — a missing method throws TypeError,
    // which parity preserves.
    this.#getAsset(assetName).api.createAccountState!()

  // TODO: do not create empty txSet objects. This needs to be dynamic anyway.
  #loadAssetSourceTxs = ({
    assetName,
    walletAccount,
    txs = [],
  }: AssetSource & { txs?: TxJson[] }): TxSet | undefined => {
    const assetSource = { assetName, walletAccount }
    if (this.#getCachedTxLog(assetSource)) return

    try {
      return TxSet.fromArray(normalizeTxsJSON({ json: txs, assets: this.#getAssets() }))
    } catch (error) {
      this.#logger.error(
        `Error occurred when parsing transactions for wallet account ${walletAccount} and asset ${assetName}:`,
        error
      )

      this.#errorTracking.track({
        error,
        context: { walletAccount, assetName },
      })
    }
  }

  #loadWalletAccountTxs = ({
    walletAccount,
    storedTxs,
  }: {
    walletAccount: string
    storedTxs: Record<string, TxJson[] | undefined>
  }): TxLogChange[] =>
    Object.entries(storedTxs)
      .map(([assetName, _txs]) => {
        const txLog = this.#loadAssetSourceTxs({
          walletAccount,
          assetName,
          txs: storedTxs[assetName],
        })

        if (txLog) return { walletAccount, assetName, txLog }
      })
      .filter(Boolean) as TxLogChange[]

  #loadAssetSourceAccountState = ({
    assetName,
    walletAccount,
    storedAccountState,
  }: AssetSource & {
    storedAccountState?: SerializedAccountState
  }): AccountState | undefined => {
    let AccountStateClass: AccountStateClass | undefined
    try {
      AccountStateClass = this.#createAccountStateClass(assetName)
    } catch (error) {
      this.#errorTracking.track({
        error,
        context: { assetName, walletAccount },
      })

      return
    }

    try {
      // TODO: do not create empty accountState objects, this needs to by dynamic anyway.
      return storedAccountState
        ? AccountStateClass!.fromJSON(storedAccountState)
        : AccountStateClass?.create()
    } catch (error) {
      this.#errorTracking.track({
        context: { assetName, walletAccount },
        error,
      })
    }
  }

  #loadWalletAccountAccountStates = ({
    walletAccount,
    storedStates,
  }: {
    walletAccount: string
    storedStates: Record<string, SerializedAccountState | undefined>
  }): AccountStateChange[] =>
    Object.entries(storedStates)
      .map(([assetName, _state]) => {
        const asset = this.#getAsset(assetName)
        if (
          assetName === asset.baseAsset.name &&
          asset.api?.createAccountState &&
          !this.#getCachedAccountState({ assetName, walletAccount })
        ) {
          const accountState = this.#loadAssetSourceAccountState({
            walletAccount,
            assetName,
            storedAccountState: storedStates[assetName],
          })

          if (accountState) return { walletAccount, assetName, accountState }
        }
      })
      .filter(Boolean) as AccountStateChange[]

  #loadWalletAccount = async ({ walletAccount }: { walletAccount: string }) => {
    const assets = Object.values(this.#getAssets())
    const assetNames = assets.map((a) => a.name)
    const keys = assets.map((asset) =>
      stringifyAssetSource({ assetName: asset.name, walletAccount })
    )
    const accountStateAssetNames = assets
      .filter((asset) => asset.name === asset.baseAsset.name && asset.api?.createAccountState)
      .map((asset) => asset.name)
    const accountStateKeys = accountStateAssetNames.map((assetName) =>
      stringifyAssetSource({ assetName, walletAccount })
    )

    const [initialTxs, initialStates] = await Promise.all([
      this.#txsStorage.batchGet(keys),
      this.#accountStatesStorage.batchGet(accountStateKeys),
    ])
    const txLogEntries = this.#loadWalletAccountTxs({
      walletAccount,
      storedTxs: zipObject(assetNames, initialTxs) as Record<string, TxJson[] | undefined>,
    })

    const accountStateEntries = this.#loadWalletAccountAccountStates({
      walletAccount,
      storedStates: zipObject(accountStateAssetNames, initialStates) as Record<
        string,
        SerializedAccountState | undefined
      >,
    })

    await this.#setCachedBlockchainMetadata({
      accountStateChanges: accountStateEntries,
      txLogChanges: txLogEntries,
      emitChanges: this.#loaded.resolved,
    })
  }

  clear = async () => {
    await Promise.all([this.#txsStorage.clear(), this.#accountStatesStorage.clear()])
    this.#txs = createNullPrototypeObject<TxLogMap>()
    this.#accountStates = createNullPrototypeObject<AccountStateMap>()
    // update atom
    await this.#setCachedBlockchainMetadata()
  }

  #getCachedAccountState = ({ assetName, walletAccount }: AssetSource) =>
    this.#accountStates[walletAccount]?.[assetName]

  #getCachedTxLog = ({ assetName, walletAccount }: AssetSource) =>
    this.#txs[walletAccount]?.[assetName]

  /**
   *
   * @param {Array<{ walletAccount, assetName, accountState }>} entries
   */
  #setCachedBlockchainMetadata = async ({
    accountStateChanges = [],
    txLogChanges = [],
    newlyReceivedTxLogs = {},
    emitChanges = true,
  }: {
    accountStateChanges?: readonly AccountStateChange[]
    txLogChanges?: readonly TxLogChange[]
    newlyReceivedTxLogs?: NewlyReceivedTxLogs
    emitChanges?: boolean
  } = {}) => {
    if (txLogChanges.length > 0) {
      const txLogCloned = cloneAssetSourceData(this.#txs)
      txLogChanges.forEach(({ walletAccount, assetName, txLog }) => {
        set(txLogCloned, [walletAccount, assetName], txLog)
      })

      this.#txs = proxyFreeze(txLogCloned)
    }

    if (accountStateChanges.length > 0) {
      const accountStateCloned = cloneAssetSourceData(this.#accountStates)
      accountStateChanges.forEach(({ walletAccount, assetName, accountState }) =>
        set(accountStateCloned, [walletAccount, assetName], accountState)
      )

      this.#accountStates = proxyFreeze(accountStateCloned)
    }

    if (!this.#loaded.resolved) return

    await Promise.all([
      ...txLogChanges.map(async ({ assetName, walletAccount, txLog }) => {
        const key = stringifyAssetSource({ assetName, walletAccount })
        return this.#txsStorage.set(key, txLog.toJSON())
      }),
      ...accountStateChanges.map(async ({ assetName, walletAccount, accountState }) => {
        const key = stringifyAssetSource({ assetName, walletAccount })
        return this.#accountStatesStorage.set(key, accountState.toJSON())
      }),
    ])

    const nextValue: BlockchainMetadataAtomValue = {
      value: { txs: this.#txs, accountStates: this.#accountStates },
      accountStateChanges:
        emitChanges === false || accountStateChanges.length === 0
          ? undefined
          : (changesArrayToObject(accountStateChanges) as AccountStateMap),
      txLogChanges:
        emitChanges === false || txLogChanges.length === 0
          ? undefined
          : (changesArrayToObject(txLogChanges) as TxLogMap),
      newlyReceivedTxLogs:
        emitChanges === false || isEmpty(newlyReceivedTxLogs) ? undefined : newlyReceivedTxLogs,
    }

    await this.#blockchainMetadataAtom.set(nextValue)
  }

  getTxLog = async ({ walletAccount, assetName }: AssetSource) => {
    const {
      value: { txs: txLogs },
    } = await this.#blockchainMetadataAtom.get()
    return txLogs[walletAccount]?.[assetName] || TxSet.EMPTY
  }

  /**
   * @deprecated use txLogsAtom or blockchainMetadataAtom instead
   * Returns cached txLogs for loaded accounts
   * @returns {Record<string, Record<string, TxSet>>} map of TxLog by asset source {
   *   [walletAccount]: {
   *     [assetName]: TxSet
   *   }
   * }
   */
  getLoadedTxLogs = async () => {
    await this.#loaded.promise
    return this.#txs
  }

  // @deprecated use accountStatesAtom or blockchainMetadataAtom instead
  getLoadedAccountStates = async () => {
    await this.#loaded.promise
    return this.#accountStates
  }

  updateTxs = async ({ assetName, walletAccount, txs }: TxParams) => {
    await this.batch().updateTxs({ assetName, walletAccount, txs }).commit()
  }

  addTxs = async ({ assetName, walletAccount, txs }: TxParams) => {
    await this.batch().addTxs({ assetName, walletAccount, txs }).commit()
  }

  removeTxs = async ({ assetName, walletAccount, txs }: TxParams) => {
    await this.batch().removeTxs({ assetName, walletAccount, txs }).commit()
  }

  overwriteTxs = async ({
    assetName,
    walletAccount,
    txs,
    notifyReceivedTxs = false,
  }: OverwriteTxsParams) => {
    await this.batch().overwriteTxs({ assetName, walletAccount, txs, notifyReceivedTxs }).commit()
  }

  clearTxs = async ({ assetName, walletAccount }: AssetSource) => {
    await this.batch().clearTxs({ assetName, walletAccount }).commit()
  }

  getAccountState = async ({ walletAccount, assetName }: AssetSource) => {
    const asset = this.#getAsset(assetName)
    const {
      value: { accountStates },
    } = await this.#blockchainMetadataAtom.get()
    const cached = accountStates[walletAccount]?.[assetName]
    if (cached) return cached

    const AccountState = asset.api?.createAccountState?.()
    return AccountState?.create()
  }

  removeAccountState = async (assetSource: AssetSource) => {
    await this.batch().removeAccountState(assetSource).commit()
  }

  updateAccountState = async ({ assetName, walletAccount, newData }: UpdateAccountStateParams) => {
    await this.batch().updateAccountState({ assetName, walletAccount, newData }).commit()
  }

  batch = () => {
    return new Batch({ onCommit: this.#handleCommit })
  }

  stop = () => {
    this.#loaded = createLoadedDeferred()
    this.#subscriptions.forEach((unsubscribe) => unsubscribe())
    this.#subscriptions = []
  }

  #updateBlockchainMetadata = async ({
    accountStates,
    txLogs,
    newlyReceivedTxLogs,
  }: BatchingChanges) => {
    const accountStateChanges = toAccountStateChangesArray(accountStates)
    const txLogChanges = toTxLogChangesArray(txLogs)
    if (accountStateChanges.length === 0 && txLogChanges.length === 0) return

    await this.#setCachedBlockchainMetadata({
      accountStateChanges,
      txLogChanges,
      newlyReceivedTxLogs,
    })
  }

  #handleCommit = async (actions: readonly BatchAction[]) => {
    await this.#loaded.promise
    const { accountStates, txLogs, newlyReceivedTxLogs } = actions.reduce<BatchingChanges>(
      (changes, action) => {
        const reduce = getReducer(action.type)

        if (!reduce) {
          this.#logger.error(`No reducer registered for ${String(action.type)}`)
          return changes
        }

        return reduce(changes, action, {
          getAsset: this.#getAsset,
          getAssets: this.#getAssets,
          getCachedTxLog: this.#getCachedTxLog,
          getCachedAccountState: this.#getCachedAccountState,
        })
      },
      { accountStates: {}, txLogs: {}, newlyReceivedTxLogs: {} }
    )

    await this.#updateBlockchainMetadata({ accountStates, txLogs, newlyReceivedTxLogs })
  }
}

const createBlockchainMetadata = (args: BlockchainMetadataDependencies): BlockchainMetadata =>
  new BlockchainMetadataImpl({ ...args })

const blockchainMetadataDefinition = {
  id: 'blockchainMetadata',
  type: 'module',
  factory: createBlockchainMetadata,
  dependencies: [
    'assetsModule',
    'storage',
    'enabledWalletAccountsAtom',
    'blockchainMetadataAtom',
    'logger',
    'errorTracking',
  ] as const,
  public: true,
} as const satisfies Definition

export default blockchainMetadataDefinition
