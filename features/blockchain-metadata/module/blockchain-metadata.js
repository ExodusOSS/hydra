import { TxSet, normalizeTxsJSON } from '@exodus/models'
import EventEmitter from 'events/events.js'
import lodash from 'lodash'
import proxyFreeze from 'proxy-freeze'
import { Batch, getReducer } from './batching/index.js'
import pDefer from 'p-defer'
import { flattenToPaths, set } from '@exodus/basic-utils'

const { isEmpty, zipObject } = lodash

const stringifyAssetSource = ({ assetName, walletAccount }) => `${walletAccount}:${assetName}`
const toChangesArray = (byAssetSource, key) =>
  flattenToPaths(byAssetSource).map(([walletAccount, assetName, data]) => ({
    walletAccount,
    assetName,
    [key]: data,
  }))

const toTxLogChangesArray = (byAssetSource) => toChangesArray(byAssetSource, 'txLog')
const toAccountStateChangesArray = (byAssetSource) => toChangesArray(byAssetSource, 'accountState')
const changesArrayToObject = (changes) => {
  const result = {}
  for (const { walletAccount, assetName, txLog, accountState } of changes) {
    set(result, [walletAccount, assetName], txLog || accountState) // pretty hacky
  }

  return result
}

const cloneAssetSourceData = (data) =>
  Object.fromEntries(
    Object.entries(data).map(([walletAccount, valuesByAssetName]) => [
      walletAccount,
      Object.fromEntries(Object.entries(valuesByAssetName)),
    ])
  )

class BlockchainMetadata extends EventEmitter {
  #txs
  #txLogsAtom
  #accountStatesAtom
  #txsStorage
  #accountStates
  #accountStatesStorage
  #walletAccountsPayload
  #assetsModule
  #enabledWalletAccountsAtom
  #loaded = pDefer()
  #subscriptions = []
  #logger
  #errorTracking

  constructor({
    assetsModule,
    storage,
    enabledWalletAccountsAtom,
    txLogsAtom,
    accountStatesAtom,
    logger,
    errorTracking,
  }) {
    super()

    this.#txs = proxyFreeze(Object.create(null))
    this.#accountStates = proxyFreeze(Object.create(null))
    this.#enabledWalletAccountsAtom = enabledWalletAccountsAtom
    this.#txLogsAtom = txLogsAtom
    this.#accountStatesAtom = accountStatesAtom
    this.#assetsModule = assetsModule
    this.#txsStorage = storage.namespace('txs')
    this.#accountStatesStorage = storage.namespace('states')
    this.#logger = logger
    this.#errorTracking = errorTracking
  }

  emit = (name, ...args) => {
    const isFreezable = (val) => val && typeof val === 'object'
    return super.emit(name, ...args.map((arg) => (isFreezable(arg) ? proxyFreeze(arg) : arg)))
  }

  load = async () => {
    if (this.#loaded.started) return

    this.#loaded.started = true

    // TODO: remove after everything uses atoms
    this.#subscriptions.push(
      this.#txLogsAtom.observe(({ value, changes, newlyReceivedTxLogs }) => {
        if (changes) {
          this.emit('tx-logs-update', changes)
        } else {
          this.emit('tx-logs', value)
        }

        if (newlyReceivedTxLogs) {
          this.emit('received-tx-logs-update', newlyReceivedTxLogs)
        }
      }),
      this.#accountStatesAtom.observe(({ value, changes }) => {
        if (changes) {
          this.emit('account-states-update', changes)
        } else {
          this.emit('account-states', value)
        }
      }),
      this.#enabledWalletAccountsAtom.observe(this.#load)
    )
  }

  #load = async (walletAccounts) => {
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
      await this.#setCachedTxLogs()
      await this.#setCachedAccountStates()
    }
  }

  // @deprecated
  sync = () => {
    this.emit('load-wallet-accounts', this.#walletAccountsPayload)
  }

  serializePayload({ assetName, walletAccount, accountState }) {
    const AccountState = this.#getAsset(assetName).api.createAccountState()
    const serialized = AccountState.serialize(accountState, { includeMem: true })
    return { assetName, walletAccount, accountState: serialized }
  }

  #getAsset = (assetName) => this.#assetsModule.getAsset(assetName)

  #getAssets = () => this.#assetsModule.getAssets()

  // TODO: do not create empty txSet objects. This needs to be dynamic anyway.
  #loadAssetSourceTxs = ({ assetName, walletAccount, txs = [] }) => {
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

  #loadWalletAccountTxs = ({ walletAccount, storedTxs }) =>
    Object.entries(storedTxs)
      .map(([assetName, txs]) => {
        const txLog = this.#loadAssetSourceTxs({
          walletAccount,
          assetName,
          txs: storedTxs[assetName],
        })

        if (txLog) return { walletAccount, assetName, txLog }
      })
      .filter(Boolean)

  #loadAssetSourceAccountState = ({ assetName, walletAccount, storedAccountState }) => {
    let AccountState
    try {
      const asset = this.#getAsset(assetName)
      AccountState = asset.api.createAccountState()
    } catch (err) {
      this.#errorTracking.track({
        error: err,
        context: { assetName, walletAccount },
      })

      return
    }

    try {
      // TODO: do not create empty accountState objects, this needs to by dynamic anyway.
      return storedAccountState ? AccountState.fromJSON(storedAccountState) : AccountState?.create()
    } catch (err) {
      this.#errorTracking.track({
        context: { assetName, walletAccount },
        error: err,
      })
    }
  }

  #loadWalletAccountAccountStates = ({ walletAccount, storedStates }) =>
    Object.entries(storedStates)
      .map(([assetName, state]) => {
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
      .filter(Boolean)

  #loadWalletAccount = async ({ walletAccount }) => {
    const assets = Object.values(this.#getAssets())
    const assetNames = assets.map((a) => a.name)
    const keys = assets.map((asset) =>
      stringifyAssetSource({ assetName: asset.name, walletAccount })
    )

    const initialTxs = await this.#txsStorage.batchGet(keys)
    const txLogEntries = this.#loadWalletAccountTxs({
      walletAccount,
      storedTxs: zipObject(assetNames, initialTxs),
    })

    const initialStates = await this.#accountStatesStorage.batchGet(keys)
    const accountStateEntries = this.#loadWalletAccountAccountStates({
      walletAccount,
      storedStates: zipObject(assetNames, initialStates),
    })

    await Promise.all([
      this.#setCachedAccountStates({
        changes: accountStateEntries,
        emitChanges: this.#loaded.resolved,
      }),
      this.#setCachedTxLogs({ changes: txLogEntries, emitChanges: this.#loaded.resolved }),
    ])
  }

  clear = async () => {
    await Promise.all([this.#txsStorage.clear(), this.#accountStatesStorage.clear()])
    this.#txs = Object.create(null)
    this.#accountStates = Object.create(null)
    // update atom
    await this.#setCachedTxLogs()
    await this.#setCachedAccountStates()
  }

  #getCachedAccountState = ({ assetName, walletAccount }) =>
    this.#accountStates[walletAccount]?.[assetName]

  /**
   *
   * @param {Array<{ walletAccount, assetName, accountState }>} entries
   */
  #setCachedAccountStates = async ({ changes = [], emitChanges = true } = {}) => {
    const cloned = cloneAssetSourceData(this.#accountStates)
    changes.forEach(({ walletAccount, assetName, accountState }) =>
      set(cloned, [walletAccount, assetName], accountState)
    )

    this.#accountStates = proxyFreeze(cloned)
    if (!this.#loaded.resolved) return

    await Promise.all(
      changes.map(async ({ assetName, walletAccount, accountState }) => {
        const key = stringifyAssetSource({ assetName, walletAccount })
        return this.#accountStatesStorage.set(key, accountState.toJSON())
      })
    )

    await this.#accountStatesAtom.set({
      value: this.#accountStates,
      changes:
        emitChanges === false || changes.length === 0 ? undefined : changesArrayToObject(changes),
    })
  }

  #getCachedTxLog = ({ assetName, walletAccount }) => this.#txs[walletAccount]?.[assetName]

  #setCachedTxLogs = async ({
    changes = [],
    newlyReceivedTxLogs = {},
    emitChanges = true,
  } = {}) => {
    const cloned = cloneAssetSourceData(this.#txs)
    changes.forEach(({ walletAccount, assetName, txLog }) => {
      set(cloned, [walletAccount, assetName], txLog)
    })

    this.#txs = proxyFreeze(cloned)
    if (!this.#loaded.resolved) return

    await Promise.all(
      changes.map(async ({ assetName, walletAccount, txLog }) => {
        const key = stringifyAssetSource({ assetName, walletAccount })
        return this.#txsStorage.set(key, txLog.toJSON())
      })
    )

    await this.#txLogsAtom.set({
      value: this.#txs,
      changes:
        emitChanges === false || changes.length === 0 ? undefined : changesArrayToObject(changes),
      newlyReceivedTxLogs:
        emitChanges === false || isEmpty(newlyReceivedTxLogs) ? undefined : newlyReceivedTxLogs,
    })
  }

  getTxLog = async ({ walletAccount, assetName }) => {
    const { value: txLogs } = await this.#txLogsAtom.get()
    return txLogs[walletAccount]?.[assetName] || TxSet.EMPTY
  }

  /**
   * @deprecated use txLogsAtom instead
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

  // @deprecated use accountStatesAtom instead
  getLoadedAccountStates = async () => {
    await this.#loaded.promise
    return this.#accountStates
  }

  updateTxs = async ({ assetName, walletAccount, txs }) => {
    await this.batch().updateTxs({ assetName, walletAccount, txs }).commit()
  }

  addTxs = async ({ assetName, walletAccount, txs }) => {
    await this.batch().addTxs({ assetName, walletAccount, txs }).commit()
  }

  removeTxs = async ({ assetName, walletAccount, txs }) => {
    await this.batch().removeTxs({ assetName, walletAccount, txs }).commit()
  }

  overwriteTxs = async ({ assetName, walletAccount, txs, notifyReceivedTxs = false }) => {
    await this.batch().overwriteTxs({ assetName, walletAccount, txs, notifyReceivedTxs }).commit()
  }

  clearTxs = async ({ assetName, walletAccount }) => {
    await this.batch().clearTxs({ assetName, walletAccount }).commit()
  }

  getAccountState = async ({ walletAccount, assetName }) => {
    const asset = this.#getAsset(assetName)
    const { value: accountStates } = await this.#accountStatesAtom.get()
    const cached = accountStates[walletAccount]?.[assetName]
    if (cached) return cached

    const AccountState = asset.api?.createAccountState?.()
    return AccountState?.create()
  }

  removeAccountState = async (assetSource) => {
    await this.batch().removeAccountState(assetSource).commit()
  }

  updateAccountState = async ({ assetName, walletAccount, newData }) => {
    await this.batch().updateAccountState({ assetName, walletAccount, newData }).commit()
  }

  batch = () => {
    return new Batch({ onCommit: this.#handleCommit })
  }

  stop = () => {
    this.#loaded = pDefer()
    this.#subscriptions.forEach((unsubscribe) => unsubscribe())
    this.#subscriptions = []
  }

  #setTxLogs = async ({ txLogs, newlyReceivedTxLogs }) => {
    const changes = toTxLogChangesArray(txLogs)
    if (changes.length === 0) return

    await this.#setCachedTxLogs({
      changes,
      newlyReceivedTxLogs,
    })
  }

  #updateAccountStates = async (accountStates) => {
    const changes = toAccountStateChangesArray(accountStates)
    if (changes.length === 0) return

    await this.#setCachedAccountStates({ changes })
  }

  #handleCommit = async (actions) => {
    await this.#loaded.promise
    const { accountStates, txLogs, newlyReceivedTxLogs } = actions.reduce(
      (changes, action) => {
        const reduce = getReducer(action.type)

        if (!reduce) {
          this.#logger.error(`No reducer registered for ${action.type}`)
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

    await Promise.all([
      this.#updateAccountStates(accountStates),
      this.#setTxLogs({ txLogs, newlyReceivedTxLogs }),
    ])
  }
}

const createBlockchainMetadata = (args) => new BlockchainMetadata({ ...args })

const blockchainMetadataDefinition = {
  id: 'blockchainMetadata',
  type: 'module',
  factory: createBlockchainMetadata,
  dependencies: [
    'assetsModule',
    'storage',
    'enabledWalletAccountsAtom',
    'txLogsAtom',
    'accountStatesAtom',
    'logger',
    'errorTracking',
  ],
  public: true,
}

export default blockchainMetadataDefinition
