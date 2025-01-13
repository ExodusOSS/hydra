import { isNumberUnit } from '@exodus/currency'
import { TxSet } from '@exodus/models'
import lodash from 'lodash'
import { difference as getChanges } from '@exodus/atoms'
import { difference, flattenToPaths, pick, set } from '@exodus/basic-utils'
import makeConcurrent from 'make-concurrent'
import { processAssetBalances, validateBalances } from './balances-utils.js'
import defaultConfig from '../default-config.js'

const { cloneDeepWith, isEmpty, merge, zipObject } = lodash

const cloneBalances = (balances) =>
  cloneDeepWith(balances, (val) => {
    if (isNumberUnit(val)) return val
  })

const zipNonNull = (keys, values) =>
  zipObject(
    keys.filter((key, i) => values[i] != null),
    values.filter((value) => value != null)
  )

class Balances {
  #logger
  #assetsModule
  #availableAssetNamesAtom
  #availableAssetNames = []
  #balanceFieldsConfig
  #balanceFields
  #walletAccounts = [] // string[]
  #ready = false

  #balances = Object.create(null)
  #balancesAtom
  #accountStatesAtom
  #txLogsAtom
  #enabledWalletAccountsAtom
  #loaded = false
  #subscriptions = []

  constructor({
    assetsModule,
    availableAssetNamesAtom,
    enabledWalletAccountsAtom,
    config,
    logger,
    balancesAtom,
    txLogsAtom,
    accountStatesAtom,
  }) {
    this.#logger = logger
    this.#assetsModule = assetsModule
    this.#availableAssetNamesAtom = availableAssetNamesAtom
    this.#balanceFieldsConfig = config?.balanceFieldsConfig || defaultConfig.balanceFieldsConfig
    this.#balanceFields = config?.balanceFields || defaultConfig.balanceFields
    this.#balancesAtom = balancesAtom
    this.#accountStatesAtom = accountStatesAtom
    this.#txLogsAtom = txLogsAtom
    this.#enabledWalletAccountsAtom = enabledWalletAccountsAtom

    const shareQueue =
      (fn) =>
      (...args) => {
        if (!this.#ready) return

        this.#pushIntoSharedQueue(() => fn.apply(this, args))
      }

    const swallowErrors =
      (fn) =>
      async (...args) => {
        try {
          return await fn(...args)
        } catch (error) {
          this.#logger.error(error)
        }
      }

    // these share a queue
    this.#updateAssetSource = shareQueue(this.#updateAssetSource)
    this.#handleTxLogUpdate = shareQueue(this.#handleTxLogUpdate)
    this.#recompute = shareQueue(this.#recompute)
    this.#onAssetsChanged = shareQueue(this.#onAssetsChanged)
    this.#getBalancesForAssetSource = swallowErrors(this.#getBalancesForAssetSource)
    this.#setWalletAccounts = swallowErrors(this.#setWalletAccounts)
  }

  load = async () => {
    if (this.#loaded) return
    this.#loaded = true

    this.#subscriptions.push(
      this.#enabledWalletAccountsAtom.observe((payload) => {
        this.#setWalletAccounts(Object.keys(payload))
      }),
      this.#accountStatesAtom.observe(({ changes }) =>
        flattenToPaths(changes).forEach(([walletAccount, assetName, accountState]) =>
          this.#handleAccountStateUpdate({ walletAccount, assetName, accountState })
        )
      ),
      this.#txLogsAtom.observe(({ changes }) =>
        flattenToPaths(changes).forEach(([walletAccount, assetName, txLog]) =>
          this.#handleTxLogUpdate({ walletAccount, assetName, txLog })
        )
      ),
      getChanges(this.#availableAssetNamesAtom).observe(({ previous = [], current }) => {
        this.#availableAssetNames = current
        const added = difference(current, previous)
        if (added.length > 0) this.#onAssetsChanged(added)
      })
    )

    this.#availableAssetNames = await this.#availableAssetNamesAtom.get()
  }

  #getAsset = (assetName) => this.#assetsModule.getAsset(assetName)

  #getAssets = () => this.#assetsModule.getAssets()

  #handleAccountStateUpdate = async (opts) => {
    if (!this.#ready) {
      this.#logger.log('ignore update from account-state event.', { isReady: this.#ready })
      return
    }

    return this.#updateAssetSource(opts)
  }

  #handleTxLogUpdate = (opts) => {
    if (!this.#ready) {
      this.#logger.log('ignore update from tx-log event.', { isReady: this.#ready })
      return
    }

    return this.#updateAssetSource(opts)
  }

  #pushIntoSharedQueue = makeConcurrent((fn) => fn(), { concurrency: 1 })

  #reset = ({ walletAccounts = this.#walletAccounts } = {}) => {
    walletAccounts.forEach((walletAccount) => {
      this.#balances[walletAccount] = Object.create(null)
    })
  }

  #getBalancesForAssetSource = async ({ walletAccount, assetName }) => {
    const metadata = await this.#loadBlockchainMetadataForBalance({ walletAccount, assetName })
    return this.#getBalancesFromBlockchainMetadata({
      assetNames: this.#getRelatedAssetNames(assetName),
      ...metadata,
    })
  }

  // It adds both old and new balances to the response.
  // Ideally, selectors should start using the new ones (total, spendable, etc)

  #getBalancesFromBlockchainMetadata = ({ assetNames, accountState, txLogsByAssetName }) => {
    // in the future accountState may have all the balances and we won't need to rely on txLog
    // for now, accountState-based balance has both the baseAsset and token balances while txLog is per asset/token
    const getAssetBalances = (assetName) => {
      const asset = this.#getAsset(assetName)
      const txLog = txLogsByAssetName[assetName]

      const zero = asset.currency.ZERO

      const apiBalances = asset.api.getBalances({ asset, accountState, txLog })
      const balances = processAssetBalances({
        balanceFieldsConfig: this.#balanceFieldsConfig,
        balances: apiBalances || Object.create(null),
        zero,
      })
      return validateBalances({
        balances: pick(balances, this.#balanceFields),
        asset,
        zero,
        logger: this.#logger,
        emitter: this,
      })
    }

    const balances = assetNames.map(getAssetBalances)
    return zipNonNull(assetNames, balances)
  }

  #getBalancesForWalletAccount = async ({ walletAccount }) => {
    const assetNames = this.#getSupportedAssetNames()
    const results = await Promise.allSettled(
      assetNames.map((assetName) => this.#getBalancesForAssetSource({ assetName, walletAccount }))
    )

    const balances = results.map(({ value }) => value).filter(Boolean)
    return merge(Object.create(null), ...balances)
  }

  #load = async ({ walletAccount }) => {
    this.#logger.log(`loading walletAccount ${walletAccount}`)
    this.#balances[walletAccount] = await this.#getBalancesForWalletAccount({ walletAccount })
  }

  #setWalletAccounts = async (walletAccounts) => {
    const added = difference(walletAccounts, this.#walletAccounts)
    const removed = difference(this.#walletAccounts, walletAccounts)
    if (added.length === 0 && removed.length === 0) return

    this.#walletAccounts = walletAccounts
    this.#ready = true
    if (removed.length > 0) {
      this.#logger.log('recomputing after removing walletAccounts', removed)
      removed.forEach((walletAccount) => {
        delete this.#balances[walletAccount]
      })
    }

    if (added.length > 0) {
      this.#logger.log('recomputing after adding walletAccounts', added)
      await this.#recompute({ walletAccounts: added })
    } else {
      this.#flush()
    }
  }

  #onAssetsChanged = async (added) => {
    if (
      added.every((name) =>
        this.#walletAccounts.every((walletAccount) => !!this.#balances?.[walletAccount]?.[name])
      )
    ) {
      return
    }

    this.#logger.log('recomputing based on new assets list')
    this.#recompute()
  }

  #isSupportedAsset = (assetName) =>
    this.#availableAssetNames.includes(assetName) && !this.#getAsset(assetName).isCombined

  #getSupportedAssetNames = () => Object.keys(this.#getAssets()).filter(this.#isSupportedAsset)

  #getRelatedAssetNames = (assetName) => {
    const asset = this.#assetsModule.getAsset(assetName)
    if (asset.baseAsset.name === assetName) {
      return [assetName, ...this.#assetsModule.getTokenNames(assetName)].filter(
        this.#isSupportedAsset
      )
    }

    return [assetName]
  }

  #loadBlockchainMetadataForBalance = async ({
    assetName,
    walletAccount,
    accountState: providedAccountState = null,
    txLogsByAssetName: providedTxLogsByAssetName = {},
  }) => {
    const { value: txLogsByAssetSource } = await this.#txLogsAtom.get()
    let accountState = providedAccountState
    if (!accountState) {
      const asset = this.#getAsset(assetName).baseAsset
      const assetNameToUse = asset.name
      const { value } = await this.#accountStatesAtom.get()
      const cached = value[walletAccount]?.[assetNameToUse]
      if (cached) {
        accountState = cached
      } else {
        const AccountState = asset.api?.createAccountState?.()
        accountState = AccountState?.create()
      }
    }

    const assetNames = this.#getRelatedAssetNames(assetName)
    const txLogsByAssetName = zipObject(
      assetNames,
      assetNames.map(
        (assetName) =>
          providedTxLogsByAssetName[assetName] ||
          txLogsByAssetSource[walletAccount]?.[assetName] ||
          TxSet.EMPTY
      )
    )

    return {
      accountState,
      txLogsByAssetName,
    }
  }

  #updateAssetSource = async ({
    assetName,
    walletAccount,
    accountState: providedAccountState,
    txLog: providedTxLog,
  }) => {
    if (!this.#isSupportedAsset(assetName)) return

    if (!this.#walletAccounts.includes(walletAccount)) {
      this.#logger.warn(`unexpected update for disabled walletAccount ${walletAccount}`)
      return
    }

    const { accountState, txLogsByAssetName } = await this.#loadBlockchainMetadataForBalance({
      assetName,
      walletAccount,
      accountState: providedAccountState,
      txLogsByAssetName: {
        [assetName]: providedTxLog,
      },
    })

    const accountBalances = this.#balances[walletAccount]
    const newBalances = this.#getBalancesFromBlockchainMetadata({
      assetNames: this.#getRelatedAssetNames(assetName),
      accountState,
      txLogsByAssetName,
    })

    const changes = Object.create(null)
    for (const subAssetName in newBalances) {
      const { currency } = this.#getAsset(subAssetName)
      const newAssetBalances = newBalances?.[subAssetName]
      // e.g. totalBalance or spendableBalance
      for (const field of this.#balanceFields) {
        const oldBalance = accountBalances?.[subAssetName]?.[field]
        const newBalance = newAssetBalances?.[field]
        if (!newBalance) continue
        if ((oldBalance || currency.ZERO).equals(newBalance)) continue

        this.#logger.log(`updating assetSource ${walletAccount}:${assetName}`)
        set(changes, [walletAccount, subAssetName, field], {
          from: oldBalance ?? currency.ZERO,
          to: newBalance,
        })

        set(accountBalances, [subAssetName, field], newBalance)
      }
    }

    if (!isEmpty(changes)) this.#flush({ changes })
  }

  #recompute = async ({ walletAccounts = this.#walletAccounts } = {}) => {
    this.#reset({ walletAccounts })
    await Promise.all(walletAccounts.map((walletAccount) => this.#load({ walletAccount })))
    this.#flush()
  }

  #flush = ({ changes } = {}) => {
    const balances = cloneBalances(this.#balances)

    if (Object.keys(balances).length === 0) return // wait till `load` finished

    this.#logger.log('balances updated')
    this.#balancesAtom.set({ balances, changes })
  }

  stop = () => {
    this.#subscriptions.forEach((unsubscribe) => unsubscribe())
    this.#subscriptions = []
  }
}

const createBalances = (opts) => new Balances(opts)

const balancesDefinition = {
  id: 'balances',
  type: 'module',
  factory: createBalances,
  dependencies: [
    'assetsModule',
    'availableAssetNamesAtom',
    'enabledWalletAccountsAtom',
    'config',
    'logger',
    'balancesAtom',
    'txLogsAtom',
    'accountStatesAtom',
  ],
  public: true,
}

export default balancesDefinition
