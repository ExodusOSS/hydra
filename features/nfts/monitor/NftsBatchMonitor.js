import EventEmitter from 'events/events.js'

import createFetchival from '@exodus/fetch/create-fetchival'

import { set, partition } from '@exodus/basic-utils'
import lodash from 'lodash'
import { DEFAULT_CONFIGS, NFTS_NETWORK_TO_ASSET_NAME, Networks } from '../constants/index.js'
import { getNftsAddresses } from './addresses-utils.js'
import {
  BATCH_FETCH_NO_TXS_INTERVAL,
  BATCH_MAX_ADDRESSES,
  BATCH_TRANSACTION_LOOKBACK_PERIOD,
  MONITOR_MINIMUM_INTERVAL,
  MONITOR_SLOW_INTERVAL,
} from './constants.js'
import { doesWalletAccountSupportNFTs, handleNftsOnImport } from './utils.js'
import { areAddressesEqual } from '../utils.js'

const { chunk, cloneDeep, get, throttle } = lodash

class NftsBatchMonitor extends EventEmitter {
  #nftsTxsAtom
  #nftsConfigAtom
  #nftsModule
  #enabledWalletAccountsAtom
  #nftBatchMonitorStatusAtom
  #config
  #logger
  #addressProvider
  #assetsModule
  #fetchival
  #isStarted = false
  #interval = MONITOR_SLOW_INTERVAL
  #minInterval = MONITOR_MINIMUM_INTERVAL
  #previousTick = 0
  #handleImportOnNextFetch = false
  #throttledTick
  #tickTimeout

  constructor({
    addressProvider,
    assetsModule,
    enabledWalletAccountsAtom,
    nftsModule,
    nftsConfigAtom,
    nftsTxsAtom,
    nftBatchMonitorStatusAtom,
    config,
    fetch,
    logger,
  }) {
    super()

    this.#nftsModule = nftsModule
    this.#nftsConfigAtom = nftsConfigAtom
    this.#nftsTxsAtom = nftsTxsAtom
    this.#addressProvider = addressProvider
    this.#assetsModule = assetsModule
    this.#nftBatchMonitorStatusAtom = nftBatchMonitorStatusAtom
    this.#enabledWalletAccountsAtom = enabledWalletAccountsAtom
    this.#config = config
    this.#logger = logger

    this.#throttledTick = throttle(this.#tick, this.#minInterval)
    const baseUrl = config?.baseUrl || DEFAULT_CONFIGS.production.baseUrl
    this.#fetchival = createFetchival({ fetch })(new URL(baseUrl))
  }

  #fetchTransactions = async ({ addresses, networks, fromTimestamp }) => {
    return this.#fetchival(`batch/transactions`).get({
      networks: networks.join(','),
      addresses: addresses.join(','),
      ...(fromTimestamp && { fromTimestamp }),
    })
  }

  #fetchNfts = async ({ addresses, networks }) => {
    const { includeListedNfts, includeSpamNfts, includeCompressedOnSolana } =
      this.#config || Object.create(null)

    return this.#fetchival(`batch/nfts`).get({
      networks: networks.join(','),
      addresses: addresses.join(','),
      ...(includeListedNfts && { includeListedNfts }),
      ...(includeCompressedOnSolana && { includeCompressed: true }),
      ...(includeSpamNfts && { includeSpam: includeSpamNfts }),
    })
  }

  #updateMonitorState = async ({ supportedNetworks, fetchState, dataVersion }) => {
    await this.#nftBatchMonitorStatusAtom.set((oldState) => ({
      ...oldState,
      ...(supportedNetworks ? { supportedNetworks } : Object.create(null)),
      ...(fetchState ? { fetchState } : Object.create(null)),
      ...(dataVersion ? { dataVersion } : Object.create(null)),
    }))
  }

  #handleNftsOnImport = async ({ nfts }) => {
    return handleNftsOnImport(
      { nfts },
      { config: this.#config, nftsConfigAtom: this.#nftsConfigAtom, nftsModule: this.#nftsModule }
    )
  }

  #fetchAndUpdateNFTs = async ({ addressChunk, networks }) => {
    const addresses = addressChunk.map(({ address }) => address)
    const uniqueAddresses = [...new Set(addresses)]
    const { data: nfts } = await this.#fetchNfts({ addresses: uniqueAddresses, networks })

    const newNftsByWalletAccount = Object.create(null)

    // initialize with empty data so that parent monitor knows
    // when a specific walletAccount+network doesn't have NFTs
    addressChunk.forEach(({ walletAccountName }) => {
      networks.forEach((network) => {
        set(newNftsByWalletAccount, [walletAccountName, network], [])
      })
    })

    nfts.forEach((nft) => {
      const walletAccountAddress = addressChunk.find(
        ({ address, network }) =>
          areAddressesEqual(nft.owner, address, { network }) && network === nft.network
      )

      if (!walletAccountAddress) return

      const walletAccountName = walletAccountAddress.walletAccountName

      const keyPath = [walletAccountName, nft.network]
      const toUpdateNfts = get(newNftsByWalletAccount, keyPath, [])

      set(newNftsByWalletAccount, keyPath, [...toUpdateNfts, nft])
    })

    if (this.#handleImportOnNextFetch) {
      try {
        await this.#handleNftsOnImport({ nfts })
      } catch (err) {
        this.#logger.warn('failed to auto-approve nfts', err.message)
      }
    }

    this.emit('nfts', newNftsByWalletAccount)
  }

  #tick = async () => {
    await this.#preFetchCheck()

    this.#previousTick = Date.now()

    const {
      supportedNetworks: networks,
      fetchState,
      dataVersion,
    } = await this.#nftBatchMonitorStatusAtom.get()

    const addressesData = await this.#getAddressesData({ networks })

    const addressChunks = chunk(addressesData, BATCH_MAX_ADDRESSES)

    for (const addressChunk of addressChunks) {
      const addresses = addressChunk.map(({ address }) => address)
      const uniqueAddresses = [...new Set(addresses)]

      const previousFetchValues = addressChunk.map(({ address, network }) =>
        get(fetchState, [network, address, 'previousFetch'], 0)
      )
      const earliestPreviousFetch = Math.min(...previousFetchValues)

      const fetchDate = Date.now()
      const fetchStartDate = Math.max(earliestPreviousFetch - BATCH_TRANSACTION_LOOKBACK_PERIOD, 0)
      let rewritingHistory = earliestPreviousFetch === 0
      let fetchData = await this.#fetchTransactions({
        addresses: uniqueAddresses,
        networks,
        fromTimestamp: fetchStartDate,
      })

      if (fetchData.dataVersion !== dataVersion && !rewritingHistory) {
        rewritingHistory = true
        fetchData = await this.#fetchTransactions({
          addresses: uniqueAddresses,
          networks,
          fromTimestamp: 0,
        })
      }

      const recentTransactions = fetchData.data
      const existingTxs = await this.#nftsTxsAtom.get()

      const getRelevantWalletAccounts = (tx) =>
        addressChunk.filter(
          ({ address, network }) =>
            network === tx.network &&
            (areAddressesEqual(tx.to, address, { network }) ||
              areAddressesEqual(tx.from, address, { network }))
        )

      if (recentTransactions.length > 0) {
        const newTxsByWalletAccount = Object.create(null)
        let newTxsAdded = false

        if (rewritingHistory) {
          recentTransactions.forEach((tx) => {
            const relevantWalletAccounts = getRelevantWalletAccounts(tx)

            relevantWalletAccounts.forEach(({ walletAccountName, address }) => {
              const keyPath = [walletAccountName, tx.network]
              const previousTxs = rewritingHistory ? [] : get(existingTxs, keyPath, [])
              const updatedTxList = get(newTxsByWalletAccount, keyPath, previousTxs)

              set(newTxsByWalletAccount, keyPath, [
                ...updatedTxList,
                { ...tx, ownerAddress: address },
              ])
            })
          })
        } else {
          const setsCache = new Map()
          const getWalletAccountTxData = (keyPath) => {
            const mapKey = keyPath.join('-')
            const previousTxs = get(existingTxs, keyPath, [])
            let updatedTxList = get(newTxsByWalletAccount, keyPath)

            // create txId Sets for faster lookup
            if (!setsCache.has(mapKey) || !updatedTxList) {
              // start with oldTxs and then add the data from the fetch request
              const [recentTxs, oldTxs] = partition(
                previousTxs,
                (existingTx) => existingTx.date >= fetchStartDate
              )

              setsCache.set(mapKey, {
                recentExistingTxsIds: new Set(recentTxs.map((tx) => tx.txId)),
                oldExistingTxsIds: new Set(oldTxs.map((tx) => tx.txId)),
              })

              updatedTxList = updatedTxList ?? oldTxs
            }

            const { recentExistingTxsIds, oldExistingTxsIds } = setsCache.get(mapKey)
            return { recentExistingTxsIds, oldExistingTxsIds, updatedTxList }
          }

          recentTransactions.forEach((tx) => {
            const relevantWalletAccounts = getRelevantWalletAccounts(tx)

            relevantWalletAccounts.forEach(({ walletAccountName, address }) => {
              const keyPath = [walletAccountName, tx.network]

              const { recentExistingTxsIds, oldExistingTxsIds, updatedTxList } =
                getWalletAccountTxData(keyPath)

              if (oldExistingTxsIds.has(tx.txId)) return

              if (!recentExistingTxsIds.has(tx.txId)) {
                newTxsAdded = true
              }

              set(newTxsByWalletAccount, keyPath, [
                ...updatedTxList,
                { ...tx, ownerAddress: address },
              ])
            })
          })
        }

        this.emit('nftsTxs', newTxsByWalletAccount)

        if (rewritingHistory || newTxsAdded) {
          await this.#fetchAndUpdateNFTs({ addressChunk, networks })
        }
      } else if (Date.now() - earliestPreviousFetch > BATCH_FETCH_NO_TXS_INTERVAL) {
        await this.#fetchAndUpdateNFTs({ addressChunk, networks })
      }

      const newFetchState = cloneDeep(fetchState || Object.create(null))

      addressChunk.forEach(({ network, address }) => {
        set(newFetchState, [network, address], { previousFetch: fetchDate })
      })

      await this.#updateMonitorState({
        fetchState: newFetchState,
        dataVersion: fetchData.dataVersion,
      })
    }

    this.#handleImportOnNextFetch = false
  }

  #getWalletAccounts = async () => {
    const walletAccounts = await this.#enabledWalletAccountsAtom.get()

    return Object.values(walletAccounts).filter(doesWalletAccountSupportNFTs)
  }

  #getAddressesData = async ({ networks }) => {
    const addresses = []

    const walletAccounts = await this.#getWalletAccounts()

    for (const network of networks) {
      const asset = this.#assetsModule.getAsset(NFTS_NETWORK_TO_ASSET_NAME[network])
      if (!asset) {
        continue
      }

      const addressesPromises = walletAccounts.map((walletAccount) =>
        getNftsAddresses({
          addressProvider: this.#addressProvider,
          asset,
          walletAccount,
        }).then((response) => {
          response.forEach((address) =>
            addresses.push({
              address: address.address,
              walletAccountName: walletAccount.toString(),
              network,
            })
          )
        })
      )

      await Promise.all(addressesPromises)
    }

    return addresses
  }

  #preFetchCheck = async () => {
    let supportedNetworks = []
    try {
      const { networks } = await this.#fetchival(`batch/status`).get()
      supportedNetworks = networks.filter((network) => Boolean(Networks[network]))
    } finally {
      await this.#updateMonitorState({
        supportedNetworks,
      })
    }
  }

  forceUpdate = async () => {
    if (!this.#isStarted) return

    await this.#tick()
  }

  refresh = async () => {
    if (!this.#isStarted) return

    await this.#throttledTick()
  }

  initialize = async () => {
    return this.#preFetchCheck()
  }

  start = async ({ fromImport } = Object.create(null)) => {
    if (fromImport) {
      this.#handleImportOnNextFetch = true
    }

    if (this.#isStarted) return

    this.#isStarted = true

    while (this.#isStarted) {
      if (Date.now() - this.#previousTick > this.#interval) {
        await this.#throttledTick()
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
      this.#throttledTick()
    }
  }
}

export default NftsBatchMonitor
