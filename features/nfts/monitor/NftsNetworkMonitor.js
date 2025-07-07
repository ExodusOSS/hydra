import EventEmitter from 'events/events.js'

import NftsDataNetworkMonitor from './NftsDataNetworkMonitor.js'
import NftsTransactionsNetworkMonitor from './NftsTransactionsNetworkMonitor.js'
import assert from 'minimalistic-assert'
import {
  NFTS_NETWORKS_WAIT_RESTORE_COMPLETE,
  NFTS_NETWORK_TO_ASSET_NAME,
} from '../constants/index.js'
import {
  doesWalletAccountSupportNFTs,
  calculateDynamicInterval,
  getFetchStatus,
  updateNetworkFetchStatus,
} from './utils.js'
import {
  DEFAULT_EMPTY_NFTS_INTERVAL_MULTIPLIER,
  DEFAULT_EMPTY_TXS_INTERVAL_MULTIPLIER,
  MONITOR_MINIMUM_INTERVAL,
  MONITOR_SLOW_INTERVAL,
} from './constants.js'

class NftsNetworkMonitor extends EventEmitter {
  #dataMonitor
  #transactionsMonitor
  #network
  #restoringAssetsAtom
  #txLogsAtom
  #enabledWalletAccountsAtom
  #activeWalletAccountAtom
  #nftsAtom
  #nftsMonitorStatusAtom
  #config
  #isStarted = false
  #interval = MONITOR_SLOW_INTERVAL
  #minInterval = MONITOR_MINIMUM_INTERVAL
  #previousTick = 0
  #handleImportOnStart
  #tickTimeout

  constructor({
    asset,
    network,
    handleImportOnStart,
    addressProvider,
    enabledWalletAccountsAtom,
    activeWalletAccountAtom,
    nftsProxy,
    nftsModule,
    nftsConfigAtom,
    nftsAtom,
    nftsMonitorStatusAtom,
    restoringAssetsAtom,
    txLogsAtom,
    logger,
    config,
  }) {
    super()

    assert(nftsProxy[network], `Network ${network} is not supported by the nft proxy yet`)

    this.#network = network
    this.#restoringAssetsAtom = restoringAssetsAtom
    this.#txLogsAtom = txLogsAtom
    this.#enabledWalletAccountsAtom = enabledWalletAccountsAtom
    this.#activeWalletAccountAtom = activeWalletAccountAtom
    this.#nftsAtom = nftsAtom
    this.#nftsMonitorStatusAtom = nftsMonitorStatusAtom
    this.#config = config
    this.#handleImportOnStart = handleImportOnStart

    this.#dataMonitor = new NftsDataNetworkMonitor({
      logger,
      asset,
      network,
      nftsMonitorStatusAtom,
      addressProvider,
      nftsProxy,
      nftsModule,
      nftsConfigAtom,
      config,
    })

    const nftsTxs = !asset.api.nfts?.noNftsTxs

    this.#transactionsMonitor = nftsTxs
      ? new NftsTransactionsNetworkMonitor({
          asset,
          network,
          addressProvider,
          nftsProxy,
          logger,
          nftsMonitorStatusAtom,
        })
      : undefined

    this.#dataMonitor.on('nfts', ({ walletAccountName, nfts }) => {
      this.emit('nfts', { [walletAccountName]: { [network]: nfts } })
    })

    this.#transactionsMonitor?.on('txs', ({ walletAccountName, txs }) =>
      this.emit('nftsTxs', { [walletAccountName]: { [network]: txs } })
    )
  }

  #waitAssetRestoreComplete = async () => {
    const assetName = NFTS_NETWORK_TO_ASSET_NAME[this.#network]
    return new Promise((resolve) => {
      if (!this.#restoringAssetsAtom) return resolve()
      const unsubscribe = this.#restoringAssetsAtom.observe((restoringAssets) => {
        if (!restoringAssets[assetName]) {
          resolve()
          unsubscribe()
        }
      })
    })
  }

  #shouldFetch = async ({ walletAccountName, lastFetchType, dynamicInterval, force }) => {
    const lastFetch = await getFetchStatus({
      atom: this.#nftsMonitorStatusAtom,
      network: this.#network,
      walletAccountName,
      type: lastFetchType,
    })

    return force || !lastFetch || Date.now() - lastFetch >= dynamicInterval
  }

  #fetchAndUpdate = async ({ monitor, walletAccount, type }) => {
    await monitor.fetch({ walletAccount })
    await updateNetworkFetchStatus({
      atom: this.#nftsMonitorStatusAtom,
      network: this.#network,
      walletAccountName: walletAccount.toString(),
      type,
    })
  }

  #fetchWalletData = async ({ walletAccount, dynamicInterval, force }) => {
    const walletAccountName = walletAccount.toString()
    if (this.#handleImportOnStart) {
      this.#dataMonitor.enableImportForWalletAccount(walletAccountName)
    }

    const fetchPromises = []

    if (
      await this.#shouldFetch({ walletAccountName, lastFetchType: 'nfts', dynamicInterval, force })
    ) {
      fetchPromises.push(
        this.#fetchAndUpdate({ monitor: this.#dataMonitor, walletAccount, type: 'nfts' })
      )
    }

    if (
      this.#transactionsMonitor &&
      (await this.#shouldFetch({ walletAccountName, lastFetchType: 'txs', dynamicInterval, force }))
    ) {
      fetchPromises.push(
        this.#fetchAndUpdate({ monitor: this.#transactionsMonitor, walletAccount, type: 'txs' })
      )
    }

    Promise.all(fetchPromises)
  }

  #tick = async ({ walletAccounts, force = false } = Object.create(null)) => {
    this.#previousTick = Date.now()
    const walletAccountsToFetch = walletAccounts || (await this.#getWalletAccountsToFetch())

    const nftsData = await this.#nftsAtom.get()
    const txLogData = await this.#txLogsAtom.get()
    const assetName = NFTS_NETWORK_TO_ASSET_NAME[this.#network]

    const emptyNftsMultiplier =
      this.#config?.emptyNftsIntervalMultiplier || DEFAULT_EMPTY_NFTS_INTERVAL_MULTIPLIER
    const emptyTxsMultiplier =
      this.#config?.emptyTxsIntervalMultiplier || DEFAULT_EMPTY_TXS_INTERVAL_MULTIPLIER

    await Promise.all(
      walletAccountsToFetch.map(async (walletAccount) => {
        const walletAccountName = walletAccount.toString()
        const nftsCount = nftsData?.[walletAccountName]?.[this.#network]?.length || 0
        const txsCount = txLogData?.value?.[walletAccountName]?.[assetName]?.size || 0

        const dynamicInterval = calculateDynamicInterval({
          baseInterval: this.#interval,
          nftsCount,
          txsCount,
          emptyNftsMultiplier,
          emptyTxsMultiplier,
          network: this.#network,
          networkMultipliers: this.#config?.networkIntervalMultipliers,
        })

        await this.#fetchWalletData({ walletAccount, dynamicInterval, force })
      })
    )

    this.#handleImportOnStart = false
  }

  #preFetchCheck = async () => {
    if (NFTS_NETWORKS_WAIT_RESTORE_COMPLETE.includes(this.#network)) {
      await this.#waitAssetRestoreComplete()
    }
  }

  #getWalletAccountsToFetch = async () => {
    // fetch for all accounts on import
    if (this.#handleImportOnStart) {
      const walletAccounts = await this.#enabledWalletAccountsAtom.get()
      return Object.values(walletAccounts).filter(doesWalletAccountSupportNFTs)
    }

    const activeAccount = await this.#activeWalletAccountAtom.get()
    if (!activeAccount) return []

    const walletAccounts = await this.#enabledWalletAccountsAtom.get()
    const fullActiveAccount = walletAccounts[activeAccount.toString()]
    if (!fullActiveAccount || !doesWalletAccountSupportNFTs(fullActiveAccount)) {
      return []
    }

    return [fullActiveAccount]
  }

  forceUpdate = async ({ walletAccountName } = Object.create(null)) => {
    if (!this.#isStarted) return

    let walletAccounts
    if (walletAccountName) {
      const allWalletAccounts = await this.#enabledWalletAccountsAtom.get()
      const fullActiveAccount = allWalletAccounts[walletAccountName]
      if (!fullActiveAccount || !doesWalletAccountSupportNFTs(fullActiveAccount)) {
        return
      }

      walletAccounts = [fullActiveAccount]
    }

    await this.#tick({ walletAccounts, force: true })
  }

  start = async () => {
    if (this.#isStarted) return

    this.#isStarted = true

    await this.#preFetchCheck()

    while (this.#isStarted) {
      const walletAccountsToFetch = await this.#getWalletAccountsToFetch()

      if (walletAccountsToFetch.length > 0) {
        await this.#tick({ walletAccounts: walletAccountsToFetch })
      }

      if (!this.#isStarted) break
      await new Promise((resolve) => {
        this.#tickTimeout = setTimeout(resolve, this.#minInterval)
      })
    }
  }

  stop = async () => {
    this.#isStarted = false
    clearTimeout(this.#tickTimeout)
  }

  setInterval = (ms) => {
    this.#interval = Math.max(ms, this.#minInterval)

    const timeSinceLastTick = Date.now() - this.#previousTick

    if (timeSinceLastTick > this.#interval) {
      this.#tick()
    }
  }
}

export default NftsNetworkMonitor
