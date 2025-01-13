import delay from 'delay'
import EventEmitter from 'events/'

import NftsDataNetworkMonitor from './NftsDataNetworkMonitor'
import NftsTransactionsNetworkMonitor from './NftsTransactionsNetworkMonitor'
import assert from 'minimalistic-assert'
import { NFTS_NETWORKS_WAIT_RESTORE_COMPLETE, NFTS_NETWORK_TO_ASSET_NAME } from '../constants'
import { calculateDynamicInterval } from './utils'
import { WalletAccount } from '@exodus/models'
import {
  DEFAULT_EMPTY_NFTS_INTERVAL_MULTIPLIER,
  DEFAULT_EMPTY_TXS_INTERVAL_MULTIPLIER,
  MONITOR_MINIMUM_INTERVAL,
  MONITOR_SLOW_INTERVAL,
} from './constants'

class NftsNetworkMonitor extends EventEmitter {
  #dataMonitor
  #transactionsMonitor
  #network
  #restoringAssetsAtom
  #txLogsAtom
  #enabledWalletAccountsAtom
  #config
  #isStarted = false
  #interval = MONITOR_SLOW_INTERVAL
  #minInterval = MONITOR_MINIMUM_INTERVAL
  #previousTick = 0
  #previousFetchData = new Map()

  constructor({
    asset,
    network,
    handleImportOnStart,
    addressProvider,
    enabledWalletAccountsAtom,
    nftsProxy,
    nftsModule,
    nftsConfigAtom,
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
    this.#config = config

    this.#dataMonitor = new NftsDataNetworkMonitor({
      logger,
      asset,
      network,
      handleImportOnStart,
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
        })
      : undefined

    this.#dataMonitor.on('nfts', ({ walletAccountName, nfts }) => {
      this.#previousFetchData.set(walletAccountName, {
        updatedAt: Date.now(),
        nftsCount: nfts.length,
      })

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

  #tick = async ({ walletAccounts } = Object.create(null)) => {
    this.#previousTick = Date.now()
    let walletAccountsToFetch = walletAccounts
    if (!walletAccounts) {
      walletAccountsToFetch = await this.#getWalletAccounts()
    }

    await Promise.all([
      this.#dataMonitor.fetch({ walletAccounts: walletAccountsToFetch }),
      this.#transactionsMonitor?.fetch({ walletAccounts: walletAccountsToFetch }),
    ])
  }

  #preFetchCheck = async () => {
    if (NFTS_NETWORKS_WAIT_RESTORE_COMPLETE.includes(this.#network)) {
      await this.#waitAssetRestoreComplete()
    }
  }

  #shouldFetchWalletAccount = async ({ walletAccountName }) => {
    const { updatedAt, nftsCount } =
      this.#previousFetchData.get(walletAccountName) || Object.create(null)

    const previousFetch = updatedAt || 0
    const txLogData = await this.#txLogsAtom.get()

    const assetName = NFTS_NETWORK_TO_ASSET_NAME[this.#network]
    const emptyNftsMultiplier =
      this.#config?.emptyNftsIntervalMultiplier || DEFAULT_EMPTY_NFTS_INTERVAL_MULTIPLIER
    const emptyTxsMultiplier =
      this.#config?.emptyTxsIntervalMultiplier || DEFAULT_EMPTY_TXS_INTERVAL_MULTIPLIER
    const txsCount = txLogData?.value?.[walletAccountName]?.[assetName]?.size

    const adjustedInterval = calculateDynamicInterval({
      baseInterval: this.#interval,
      txsCount,
      nftsCount,
      emptyNftsMultiplier,
      emptyTxsMultiplier,
    })

    return Date.now() - previousFetch >= adjustedInterval
  }

  #getWalletAccountsToFetch = async () => {
    const allWalletAccounts = await this.#getWalletAccounts()
    const accountsToFetch = []
    for (const walletAccount of allWalletAccounts) {
      const fetchNow = await this.#shouldFetchWalletAccount({
        walletAccountName: walletAccount.toString(),
      })

      if (fetchNow) {
        accountsToFetch.push(walletAccount)
      }
    }

    return accountsToFetch
  }

  #getWalletAccounts = async () => {
    const walletAccounts = await this.#enabledWalletAccountsAtom.get()

    return Object.values(walletAccounts).filter(
      (account) => account.isSoftware || account.source === WalletAccount.LEDGER_SRC
    )
  }

  forceUpdate = async () => {
    if (!this.#isStarted) return

    await this.#preFetchCheck()
    await this.#tick()
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

      await delay(this.#minInterval)
    }
  }

  stop = async () => {
    this.#isStarted = false
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
