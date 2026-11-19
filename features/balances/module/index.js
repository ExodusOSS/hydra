import { safeString } from '@exodus/safe-string'
import { TxSet } from '@exodus/models'
import { difference as getChanges } from '@exodus/atoms'
import { difference, pick, set, mapValues } from '@exodus/basic-utils'
import makeConcurrent from 'make-concurrent'
import { processAssetBalances, validateBalances } from './balances-utils.js'
import defaultConfig from '../default-config.js'

const zipObject = (keys, values) => {
  const result = Object.create(null)
  for (const [i, key] of keys.entries()) {
    result[key] = values[i]
  }

  return result
}

export const cloneBalances = (balances) => {
  const result = Object.create(null)
  for (const walletAccount of Object.keys(balances)) {
    const accountBalances = balances[walletAccount]
    const clonedAccount = Object.create(null)
    for (const assetName of Object.keys(accountBalances)) {
      clonedAccount[assetName] = { ...accountBalances[assetName] }
    }

    result[walletAccount] = clonedAccount
  }

  return result
}

const zipNonNull = (keys, values) => {
  const result = Object.create(null)
  for (const [i, key] of keys.entries()) {
    if (values[i] != null) result[key] = values[i]
  }

  return result
}

class Balances {
  #logger
  #assetsAtom
  #assets = Object.create(null)
  #availableAssetNamesAtom
  #availableAssetNames = []
  #balanceFieldsConfig
  #balanceFields
  #walletAccounts = [] // string[]
  #ready = false

  #balances = Object.create(null)
  #balancesAtom
  #blockchainMetadataAtom
  #feeDataAtom
  #enabledWalletAccountsAtom
  #loaded = false
  #subscriptions = []
  #errorTracking
  constructor({
    assetsAtom,
    availableAssetNamesAtom,
    enabledWalletAccountsAtom,
    config,
    logger,
    balancesAtom,
    blockchainMetadataAtom,
    feeDataAtom,
    errorTracking,
  }) {
    this.#logger = logger
    this.#assetsAtom = assetsAtom
    this.#availableAssetNamesAtom = availableAssetNamesAtom
    this.#balanceFieldsConfig = config?.balanceFieldsConfig || defaultConfig.balanceFieldsConfig
    this.#balanceFields = config?.balanceFields || defaultConfig.balanceFields
    this.#balancesAtom = balancesAtom
    this.#blockchainMetadataAtom = blockchainMetadataAtom
    this.#feeDataAtom = feeDataAtom
    this.#enabledWalletAccountsAtom = enabledWalletAccountsAtom
    this.#errorTracking = errorTracking

    const shareQueue =
      (fn) =>
      (...args) => {
        if (!this.#ready) return

        this.#pushIntoSharedQueue(() => fn.apply(this, args))
      }

    const swallowErrors =
      (fn, method) =>
      async (...args) => {
        try {
          return await fn(...args)
        } catch (error) {
          this.#errorTracking.track({ error: new Error(method, { cause: error }) })
        }
      }

    // these share a queue
    this.#updateAssetSource = shareQueue(this.#updateAssetSource)
    this.#handleBlockchainMetadataUpdate = shareQueue(this.#handleBlockchainMetadataUpdate)
    this.#handleFeeDataUpdate = shareQueue(this.#handleFeeDataUpdate)
    this.#recompute = shareQueue(this.#recompute)
    this.#onAssetsChanged = shareQueue(this.#onAssetsChanged)
    this.#getBalancesForAssetSource = swallowErrors(
      this.#getBalancesForAssetSource,
      safeString`getBalancesForAssetSource`
    )
    this.#setWalletAccounts = swallowErrors(this.#setWalletAccounts, safeString`setWalletAccounts`)
  }

  load = async () => {
    if (this.#loaded) return
    this.#loaded = true

    const { value } = await this.#assetsAtom.get()
    this.#assets = value

    this.#subscriptions.push(
      this.#assetsAtom.observe(({ value }) => {
        this.#assets = value
      }),
      this.#enabledWalletAccountsAtom.observe((payload) => {
        void this.#setWalletAccounts(Object.keys(payload))
      }),
      this.#blockchainMetadataAtom.observe(({ accountStateChanges, txLogChanges }) => {
        this.#flattenToBlockchainMetadataObjects({ accountStateChanges, txLogChanges }).forEach(
          ({ walletAccount, assetName, accountState, txLogsByAssetName }) =>
            this.#handleBlockchainMetadataUpdate({
              walletAccount,
              assetName,
              accountState,
              txLogsByAssetName,
            })
        )
      }),
      this.#feeDataAtom.observe((changes) => {
        Object.entries(changes).forEach(([assetName, feeData]) => {
          const asset = this.#getAsset(assetName).baseAsset
          if (asset.api?.features?.balancesRequireFeeData) {
            this.#walletAccounts.forEach((walletAccount) => {
              return this.#handleFeeDataUpdate({ walletAccount, assetName, feeData })
            })
          }
        })
      }),

      getChanges(this.#availableAssetNamesAtom).observe(({ previous = [], current }) => {
        this.#availableAssetNames = current
        const added = difference(current, previous)
        const removed = difference(previous, current)
        if (added.length > 0 || removed.length > 0) void this.#onAssetsChanged({ added, removed })
      })
    )

    this.#availableAssetNames = await this.#availableAssetNamesAtom.get()
  }

  #getAsset = (assetName) => this.#assets[assetName]

  #getAssets = () => this.#assets

  #flattenToBlockchainMetadataObjects = ({
    accountStateChanges = Object.create(null),
    txLogChanges = Object.create(null),
  }) => {
    const byBaseAssetName = mapValues(accountStateChanges, (accountStates) =>
      mapValues(accountStates, (accountState) => ({ accountState }))
    )

    Object.entries(txLogChanges).forEach(([walletAccount, txLogs]) => {
      Object.entries(txLogs).map(([assetName, txLog]) => {
        const { baseAsset } = this.#getAsset(assetName)
        set(byBaseAssetName, [walletAccount, baseAsset.name, 'txLogsByAssetName', assetName], txLog)
      })
    })

    return Object.entries(byBaseAssetName).flatMap(([walletAccount, baseAssets]) =>
      Object.entries(baseAssets).map(([baseAssetName, { accountState, txLogsByAssetName }]) => ({
        walletAccount,
        assetName: baseAssetName,
        ...(accountState && { accountState }),
        ...(txLogsByAssetName && { txLogsByAssetName }),
      }))
    )
  }

  #handleBlockchainMetadataUpdate = (opts) => {
    if (!this.#ready) {
      this.#logger.log('ignore update from blockchain-metadata event.', { isReady: this.#ready })
      return
    }

    return this.#updateAssetSource(opts)
  }

  #handleFeeDataUpdate = (opts) => {
    if (!this.#ready) {
      this.#logger.log('ignore update from fee-data event.', { isReady: this.#ready })
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

  #getBalancesFromBlockchainMetadata = ({
    assetNames,
    accountState,
    feeData,
    txLogsByAssetName,
  }) => {
    // in the future accountState may have all the balances and we won't need to rely on txLog
    // for now, accountState-based balance has both the baseAsset and token balances while txLog is per asset/token
    const getAssetBalances = (assetName) => {
      const asset = this.#getAsset(assetName)
      const txLog = txLogsByAssetName[assetName]

      const zero = asset.currency.ZERO

      const apiBalances = asset.api.getBalances({ asset, accountState, txLog, feeData })
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
    return Object.assign(Object.create(null), ...balances)
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

  #onAssetsChanged = async ({ added, removed }) => {
    if (removed.length > 0) {
      for (const walletAccount of this.#walletAccounts) {
        for (const assetName of removed) {
          delete this.#balances[walletAccount]?.[assetName]
        }
      }
    }

    const newSupportedAssets = added.filter(this.#isSupportedAsset)
    const missingAssets = newSupportedAssets.filter(
      (name) =>
        !this.#walletAccounts.every((walletAccount) => !!this.#balances?.[walletAccount]?.[name])
    )

    if (missingAssets.length === 0) {
      if (removed.length > 0) this.#flush()
      return
    }

    this.#logger.log('computing balances for newly available assets', missingAssets)
    await Promise.all(
      this.#walletAccounts.map(async (walletAccount) => {
        const balances = await Promise.all(
          missingAssets.map((assetName) =>
            this.#getBalancesForAssetSource({ assetName, walletAccount })
          )
        )
        if (this.#balances[walletAccount]) {
          Object.assign(this.#balances[walletAccount], ...balances)
        }
      })
    )

    this.#flush()
  }

  #isSupportedAsset = (assetName) => {
    if (!this.#availableAssetNames.includes(assetName)) return false
    const asset = this.#getAsset(assetName)
    return asset && !asset.isCombined
  }

  #getSupportedAssetNames = () => Object.keys(this.#getAssets()).filter(this.#isSupportedAsset)

  #getRelatedAssetNames = (assetName) => {
    const asset = this.#assets[assetName]
    if (asset.baseAsset.name === assetName) {
      return Object.keys(this.#assets).filter(
        (name) => this.#assets[name].baseAsset.name === assetName && this.#isSupportedAsset(name)
      )
    }

    return [assetName]
  }

  #loadBlockchainMetadataForBalance = async ({
    assetName,
    walletAccount,
    feeData: providedFeeData, // it's optional, undefined when balancesRequireFeeData is disabled
    accountState: providedAccountState = null,
    txLogsByAssetName: providedTxLogsByAssetName = {},
  }) => {
    const {
      value: { txs: txLogsByAssetSource, accountStates },
    } = await this.#blockchainMetadataAtom.get()
    let accountState = providedAccountState

    const baseAsset = this.#getAsset(assetName).baseAsset

    if (!accountState) {
      const cached = accountStates[walletAccount]?.[baseAsset.name]
      if (cached) {
        accountState = cached
      } else {
        const AccountState = baseAsset.api?.createAccountState?.()
        accountState = AccountState?.create()
      }
    }

    let feeData = providedFeeData
    if (!feeData && baseAsset.api?.features?.balancesRequireFeeData) {
      const fees = await this.#feeDataAtom.get()
      feeData = fees[baseAsset.name]
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
      feeData,
      accountState,
      txLogsByAssetName,
    }
  }

  #updateAssetSource = async ({
    assetName,
    walletAccount,
    accountState: providedAccountState,
    txLogsByAssetName: providedTxLogsByAssetName,
    feeData: providedFeeData,
  }) => {
    if (!this.#isSupportedAsset(assetName)) return

    if (!this.#walletAccounts.includes(walletAccount)) {
      this.#logger.warn(`unexpected update for disabled walletAccount ${walletAccount}`)
      return
    }

    const { accountState, txLogsByAssetName, feeData } =
      await this.#loadBlockchainMetadataForBalance({
        assetName,
        walletAccount,
        feeData: providedFeeData,
        accountState: providedAccountState,
        txLogsByAssetName: providedTxLogsByAssetName,
      })

    const accountBalances = this.#balances[walletAccount]
    const newBalances = this.#getBalancesFromBlockchainMetadata({
      assetNames: this.#getRelatedAssetNames(assetName),
      accountState,
      txLogsByAssetName,
      feeData,
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

    if (Object.keys(changes).length > 0) this.#flush({ changes })
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
    'assetsAtom',
    'availableAssetNamesAtom',
    'enabledWalletAccountsAtom',
    'config',
    'logger',
    'balancesAtom',
    'blockchainMetadataAtom',
    'feeDataAtom',
    'errorTracking',
  ],
  public: true,
}

export default balancesDefinition
