import EventEmitter from 'events/'
import { flattenToPaths } from '@exodus/basic-utils'
import pDefer from 'p-defer'
import makeConcurrent from 'make-concurrent'

import NftsNetworkMonitor from './NftsNetworkMonitor'
import assert from 'minimalistic-assert'
import { ASSET_NAME_TO_NFTS_NETWORK } from '../constants'
import NftsBatchMonitor from './NftsBatchMonitor'

class NftsMonitor extends EventEmitter {
  #monitors = new Map()
  #batchMonitor
  #handleImportOnStart = false
  #nftsProxy
  #addressProvider
  #baseAssetNamesToMonitorAtom
  #enabledWalletAccountsAtom
  #restoringAssetsAtom
  #txLogsAtom
  #nftBatchMonitorStatusAtom
  #assetsModule
  #nftsAtom
  #nftsTxsAtom
  #nftsModule
  #nftsConfigAtom
  #config
  #unobserveBaseAssetNames
  #unobserveTxLogs
  #logger

  constructor({
    addressProvider,
    baseAssetNamesToMonitorAtom,
    enabledWalletAccountsAtom,
    restoringAssetsAtom,
    txLogsAtom,
    nftsAtom,
    nftsTxsAtom,
    nftsProxy,
    nftsConfigAtom,
    nftBatchMonitorStatusAtom,
    assetsModule,
    nfts,
    config,
    fetch,
    logger,
  }) {
    super()

    this.#nftsProxy = nftsProxy
    this.#addressProvider = addressProvider
    this.#assetsModule = assetsModule
    this.#nftsModule = nfts
    this.#nftsAtom = nftsAtom
    this.#nftsTxsAtom = nftsTxsAtom
    this.#nftsConfigAtom = nftsConfigAtom
    this.#config = config
    this.#baseAssetNamesToMonitorAtom = baseAssetNamesToMonitorAtom
    this.#enabledWalletAccountsAtom = enabledWalletAccountsAtom
    this.#restoringAssetsAtom = restoringAssetsAtom
    this.#txLogsAtom = txLogsAtom
    this.#nftBatchMonitorStatusAtom = nftBatchMonitorStatusAtom
    this.#logger = logger

    if (config?.useBatchMonitor) {
      this.#batchMonitor = new NftsBatchMonitor({
        addressProvider,
        assetsModule,
        enabledWalletAccountsAtom,
        nftsModule: nfts,
        nftsConfigAtom,
        nftsTxsAtom,
        nftBatchMonitorStatusAtom,
        config,
        fetch,
        logger,
      })
    }
  }

  #startOne = async (assetName) => {
    const asset = this.#assetsModule.getAsset(assetName)

    assert(asset.api.hasFeature, `asset.api.hasFeature is required. Is ${assetName} a base asset?`)
    if (!asset.api.hasFeature('nfts')) return

    const network = ASSET_NAME_TO_NFTS_NETWORK[assetName] || assetName

    if (!this.#nftsProxy[network]) {
      this.#logger.warn(`NFTs proxy does not support network ${network}`)
      return
    }

    if (this.#monitors.has(assetName)) return

    if (this.#config?.useBatchMonitor) {
      const nftBatchMonitorStatus = await this.#nftBatchMonitorStatusAtom.get()

      if (nftBatchMonitorStatus?.supportedNetworks?.includes(network)) return
    }

    const monitor = new NftsNetworkMonitor({
      asset,
      network,
      addressProvider: this.#addressProvider,
      enabledWalletAccountsAtom: this.#enabledWalletAccountsAtom,
      nftsProxy: this.#nftsProxy,
      nftsModule: this.#nftsModule,
      nftsConfigAtom: this.#nftsConfigAtom,
      restoringAssetsAtom: this.#restoringAssetsAtom,
      txLogsAtom: this.#txLogsAtom,
      logger: this.#logger,
      handleImportOnStart: this.#handleImportOnStart,
      config: this.#config,
    })

    this.#monitors.set(assetName, monitor)

    monitor.on('nfts', this.#updateNfts)
    monitor.on('nftsTxs', this.#updateNftsTxs)

    // We don't await on purpose, as it blocks baseAssetNamesToMonitorAtom observe chain
    // TODO: await for first monitor tick here and then resolve
    monitor.start()
  }

  #stopOne = async (assetName) => {
    const monitor = this.#monitors.get(assetName)

    if (!monitor) return

    await monitor.stop()

    this.#monitors.delete(assetName)
  }

  #mergeUpdates = (sources) => {
    const result = Object.create(null)
    // merge only the first 2 levels (walletAccount, network)
    sources.forEach((obj) => {
      Object.keys(obj).forEach((walletAccountName) => {
        if (!result[walletAccountName]) {
          result[walletAccountName] = Object.create(null)
        }

        Object.keys(obj[walletAccountName]).forEach((network) => {
          result[walletAccountName][network] = obj[walletAccountName][network]
        })
      })
    })

    return result
  }

  #updateNfts = (data) => {
    this.#nftsAtom.set((oldValue) => this.#mergeUpdates([oldValue, data]))
    this.emit('nfts', data) // TODO: Remove
  }

  #updateNftsTxs = (data) => {
    this.#nftsTxsAtom.set((oldValue) => this.#mergeUpdates([oldValue, data]))
    this.emit('nftsTxs', data) // TODO: Remove
  }

  start = async () => {
    this.#unobserveBaseAssetNames?.()

    const observePromise = pDefer()

    try {
      if (this.#batchMonitor) {
        await this.#batchMonitor.initialize()
        this.#batchMonitor.on('nfts', this.#updateNfts)
        this.#batchMonitor.on('nftsTxs', this.#updateNftsTxs)
        this.#batchMonitor.start({ fromImport: this.#handleImportOnStart })
      }
    } catch {}

    const monitorAssets = makeConcurrent(async (nextAssetNames) => {
      const currentAssetNames = [...this.#monitors.keys()]

      await Promise.all(
        currentAssetNames
          .filter((assetName) => !nextAssetNames.includes(assetName))
          .map((assetName) => this.#stopOne(assetName))
      )

      nextAssetNames.map((network) => this.#startOne(network))

      observePromise.resolve()
    })

    this.#unobserveBaseAssetNames = this.#baseAssetNamesToMonitorAtom.observe(monitorAssets)

    this.#unobserveTxLogs = this.#txLogsAtom.observe(({ changes }) => {
      this.#batchMonitor?.refresh()
      flattenToPaths(changes).forEach(([_walletAccount, assetName]) => {
        const monitor = this.#monitors.get(assetName)
        if (monitor) {
          monitor.forceUpdate()
        }
      })
    })

    await observePromise.promise
  }

  stop = async () => {
    this.#handleImportOnStart = false
    this.#batchMonitor?.stop()
    await Promise.all([...this.#monitors.keys()].map((assetName) => this.#stopOne(assetName)))
    this.#unobserveBaseAssetNames?.()
    this.#unobserveTxLogs?.()
  }

  setInterval = (ms) => {
    this.#batchMonitor?.setInterval(ms)
    return this.#monitors.forEach((monitor) => monitor.setInterval(ms))
  }

  forceFetch = async () => {
    await Promise.allSettled([
      this.#batchMonitor?.forceUpdate(),
      ...[...this.#monitors.values()].map((monitor) => monitor.forceUpdate()),
    ])
  }

  handleNftsOnImport = async () => {
    this.#handleImportOnStart = true
  }
}

export const createNftsMonitor = (args) => new NftsMonitor({ ...args })

const nftsMonitorDefinition = {
  id: 'nftsMonitor',
  type: 'monitor',
  factory: createNftsMonitor,
  dependencies: [
    'addressProvider',
    'baseAssetNamesToMonitorAtom',
    'enabledWalletAccountsAtom',
    'nftsProxy',
    'assetsModule',
    'config',
    'fetch',
    'nfts',
    'nftsAtom',
    'nftsTxsAtom',
    'nftsConfigAtom',
    'nftBatchMonitorStatusAtom',
    'restoringAssetsAtom?',
    'txLogsAtom',
    'logger',
  ],
  public: true,
}

export default nftsMonitorDefinition
