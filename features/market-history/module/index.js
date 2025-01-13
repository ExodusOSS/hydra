import { mapValues } from '@exodus/basic-utils'
import { fetchHistoricalPrices, fetchPricesInterval } from '@exodus/price-api'
import ms from 'ms'

import { getAssetFromTicker, parseGranularity } from '../utils'
import { combine, createInMemoryAtom, difference } from '@exodus/atoms'
import dayjs from '@exodus/dayjs'
import { byArguments as makeConcurrentByArguments } from 'make-concurrent'

const CLEAR_MARKET_HISTORY_CACHE_KEY = 'clear-market-history-cache'
const CLEAR_MARKET_HISTORY_CACHE_FROM_REMOTE_CONFIG_KEY =
  'clear-market-history-cache-from-remote-config'
const MARKET_HISTORY_REFRESH_KEY = 'market-history-cache-refresh'

const transformPriceEntries = (entries = []) => {
  const closePrices = entries.map((entry) => [entry[0], entry[1].close])
  return Object.fromEntries(closePrices)
}

const transformPricesByAssetName = (pricesByAssetName) =>
  mapValues(pricesByAssetName, (entries) => transformPriceEntries(entries))

const mergePricesInAtom = ({ prices, atomData, parsedGranularity, currency }) => {
  return {
    ...atomData,
    [currency]: {
      ...atomData[currency],
      [parsedGranularity]: {
        ...atomData[currency]?.[parsedGranularity],
        ...prices,
      },
    },
  }
}

// when provided cache version from local or remote config is different from stored on device we clear the cache and fetch new prices
const _invalidateStorageCache = async ({
  storage,
  clearRuntimeCache,
  clearCacheVersion,
  remoteConfigClearCacheVersion,
}) => {
  const clearCacheVersionInStorage = await storage.get(CLEAR_MARKET_HISTORY_CACHE_KEY)
  const clearCacheFromRemoteConfigVersionInStorage = await storage.get(
    CLEAR_MARKET_HISTORY_CACHE_FROM_REMOTE_CONFIG_KEY
  )
  const localAreEqual = !clearCacheVersion || clearCacheVersionInStorage === clearCacheVersion
  const remoteAreEqual =
    !remoteConfigClearCacheVersion ||
    clearCacheFromRemoteConfigVersionInStorage === remoteConfigClearCacheVersion

  if (localAreEqual && remoteAreEqual) return // we already cleared cache

  await storage.clear()
  clearRuntimeCache()

  return Promise.all([
    storage
      .set(CLEAR_MARKET_HISTORY_CACHE_KEY, clearCacheVersion || '')
      .catch((e) => console.warn(e)),
    storage
      .set(CLEAR_MARKET_HISTORY_CACHE_FROM_REMOTE_CONFIG_KEY, remoteConfigClearCacheVersion || '')
      .catch((e) => console.warn(e)),
  ])
}

const getCacheKeyDefault = ({ currency, assetName, granularity }) =>
  `prices-${currency}-${assetName}-${granularity}`

const getOldestTimestampFromCache = (cache) =>
  cache.length === 0 ? null : Math.min(...cache.map((item) => item[0]))

const filterMapAssetDataFromServer = (data) =>
  data
    .filter((piece) => piece.close !== 0)
    .map((piece) => [piece.time * 1000, { close: piece.close }])

class MarketHistoryMonitor {
  #pricingClient
  #currencyAtom
  #currency = null
  #getCacheKey = getCacheKeyDefault
  #remoteConfigRefreshIntervalAtom = null
  #clearCacheAtom = null
  #remoteConfigClearCacheAtom = null
  #runtimeCache = new Map()
  #marketHistoryAtom = null
  #enabledAssetsAtom = null
  #granularityRequestLimits = null
  #logger = null
  #abortController = new AbortController()
  #synchronizedTime

  constructor({
    assetsModule,
    storage,
    currencyAtom,
    pricingClient,
    getCacheKey = getCacheKeyDefault,
    remoteConfigRefreshIntervalAtom = null,
    clearCacheAtom = createInMemoryAtom({ defaultValue: null }),
    remoteConfigClearCacheAtom = createInMemoryAtom({ defaultValue: null }),
    enabledAssetsAtom,
    marketHistoryAtom,
    logger,
    config = Object.create(null),
    synchronizedTime,
  }) {
    const { granularityRequestLimits } = config
    if (!granularityRequestLimits) {
      throw new Error('granularityRequestLimits required')
    }

    this.assetsModule = assetsModule
    this.storage = storage
    this.#pricingClient = pricingClient
    this.#getCacheKey = getCacheKey
    this.#remoteConfigRefreshIntervalAtom = remoteConfigRefreshIntervalAtom
    this.#clearCacheAtom = clearCacheAtom
    this.#remoteConfigClearCacheAtom = remoteConfigClearCacheAtom
    this.#currencyAtom = currencyAtom
    this.#enabledAssetsAtom = enabledAssetsAtom
    this.#marketHistoryAtom = marketHistoryAtom
    this.#logger = logger
    this.#granularityRequestLimits = granularityRequestLimits
    this.#synchronizedTime = synchronizedTime
  }

  #started = false

  #setCache = async ({ currency, granularity, pricesByAssetName }) => {
    let hasChanges = false
    const changes = Object.keys(pricesByAssetName).reduce((acc, assetName) => {
      const key = this.#getCacheKey({ currency, assetName, granularity })
      const values = pricesByAssetName[assetName]
      if (values.length > 0) {
        hasChanges = true
        acc[key] = values
        this.#runtimeCache.set(key, values)
      }

      return acc
    }, Object.create(null))

    if (!hasChanges) return
    await this.storage.batchSet(changes)
  }

  #getCache = async ({ currency, granularity, assetName }) => {
    const key = this.#getCacheKey({ currency, assetName, granularity })
    const cachedValue = this.#runtimeCache.get(key)
    if (cachedValue) {
      return cachedValue
    }

    const cache = (await this.storage.get(key)) || []
    this.#runtimeCache.set(key, cache)

    return cache
  }

  #getRuntimeCacheKey = ({ fiatTicker, granularity, assetTicker }) =>
    this.#getCacheKey({
      currency: fiatTicker,
      granularity,
      assetName: getAssetFromTicker(this.assetsModule.getAssets(), assetTicker).name,
    })

  #fetch = async ({ currency, granularity, assetNames, requestLimit, dontReturnCache }) => {
    const assets = this.assetsModule.getAssets()
    const assetTickers = assetNames.map((assetName) => assets[assetName].ticker)

    const cacheRefreshData =
      (await this.storage.get(MARKET_HISTORY_REFRESH_KEY)) || Object.create(null)

    const cacheRefreshKey = `${granularity}-${currency}`
    const latestRefreshTimestamp = cacheRefreshData[cacheRefreshKey] || 0
    const refreshIntervalMs = this.#remoteConfigRefreshIntervalAtom
      ? await this.#remoteConfigRefreshIntervalAtom.get()
      : null
    const ignoreCache =
      !!refreshIntervalMs &&
      !Number.isNaN(refreshIntervalMs) &&
      this.#synchronizedTime.now() - latestRefreshTimestamp > refreshIntervalMs
    if (ignoreCache) {
      cacheRefreshData[cacheRefreshKey] = this.#synchronizedTime.now()
      await this.storage.set(MARKET_HISTORY_REFRESH_KEY, cacheRefreshData)
    }

    // TODO migrate logic from fetchHistoricalPrices inside this module.
    const { fetchedPricesMap, historicalPricesMap } = await fetchHistoricalPrices({
      api: (...args) => this.#pricingClient.historicalPrice(...args),
      assetTickers,
      fiatTicker: currency,
      granularity,
      ignoreInvalidSymbols: true,
      getCurrentTime: this.#synchronizedTime.now,
      getCacheFromStorage: async (ticker) =>
        this.#getCache({
          currency,
          granularity,
          assetName: getAssetFromTicker(assets, ticker)?.name,
        }),
      ignoreCache,
      runtimeCache: this.#runtimeCache,
      getRuntimeCacheKey: ({ fiatTicker, granularity, assetTicker }) =>
        this.#getRuntimeCacheKey({ fiatTicker, granularity, assetTicker }),
      requestLimit: requestLimit || this.#granularityRequestLimits[granularity],
    })

    const mapPrices = (pricesMap) => {
      return Object.fromEntries(
        assetNames.map((assetName) => {
          const assetPricesMap = pricesMap.get(assets[assetName].ticker)
          const value = assetPricesMap ? [...assetPricesMap] : []
          return [assetName, value]
        })
      )
    }

    const pricesByAssetName = mapPrices(fetchedPricesMap)

    const fullHistoryByAssetName =
      fetchedPricesMap.size === historicalPricesMap.size
        ? pricesByAssetName
        : mapPrices(historicalPricesMap)

    if (fetchedPricesMap.size === 0 && dontReturnCache) {
      return
    }

    this.#setCache({ currency, granularity, pricesByAssetName })

    return transformPricesByAssetName(fullHistoryByAssetName)
  }

  update = async (granularity) => {
    const enabledAssets = await this.#enabledAssetsAtom.get()
    const parsedGranularity = parseGranularity(granularity)
    const currency = this.#currency
    const assetNames = Object.keys(enabledAssets)
    const hasRuntimeCache = this.#runtimeCache.size > 0

    try {
      const prices = await this.#fetch({
        currency,
        granularity,
        assetNames,
        dontReturnCache: hasRuntimeCache,
      })

      if (!prices) {
        return
      }

      await this.#marketHistoryAtom.set(async (current) => ({
        data: mergePricesInAtom({
          prices,
          atomData: current?.data ?? Object.create(null),
          currency,
          parsedGranularity,
        }),
      }))
    } catch (error) {
      this.#logger.error(
        'MarketHistoryMonitor: Failed to fetch rates',
        assetNames,
        currency,
        parsedGranularity,
        error
      )
    }
  }

  #updateAll = () => {
    return Promise.all([this.update('hour'), this.update('day')])
  }

  #updateAssets = async (granularity, assetNames) => {
    const parsedGranularity = parseGranularity(granularity)
    const currency = this.#currency

    try {
      return await this.#fetch({
        currency,
        granularity,
        assetNames,
      })
    } catch (error) {
      this.#logger.error(
        'MarketHistoryMonitor: Failed to fetch rates for assets',
        assetNames,
        currency,
        parsedGranularity,
        error
      )
    }
  }

  #updateNewAssets = async (assetNames) => {
    const currency = this.#currency

    const granularities = ['hour', 'day']

    const promises = granularities.map((granularity) => this.#updateAssets(granularity, assetNames))

    const results = await Promise.all(promises)
    let changes = Object.create(null)
    const updateChanges = ({ prices, granularity }) => {
      changes = {
        ...changes,
        [currency]: {
          ...changes[currency],
          [granularity]: prices,
        },
      }
    }

    granularities.forEach((granularity, index) => {
      const result = results[index]
      if (result) {
        updateChanges({ prices: result, granularity: parseGranularity(granularity) })
      }
    })

    if (Object.keys(changes).length > 0) {
      await this.#marketHistoryAtom.set((current) => {
        let data = current?.data ?? Object.create(null)
        granularities.forEach((granularity, index) => {
          const result = results[index]
          if (result) {
            data = mergePricesInAtom({
              prices: result,
              atomData: data,
              currency,
              parsedGranularity: parseGranularity(granularity),
            })
          }
        })

        return {
          data,
          changes,
        }
      })
    }
  }

  #invalidateStorage = async ({ remoteConfigClearCacheVersion }) => {
    const clearCacheVersion = await this.#clearCacheAtom.get() // don't think we need to observe it considering this runs only on startup and set manually in config
    return _invalidateStorageCache({
      storage: this.storage,
      clearRuntimeCache: () => {
        this.#runtimeCache = new Map()
      },
      clearCacheVersion,
      remoteConfigClearCacheVersion,
    })
  }

  #listenRemoteConfigClearCacheVersionChanges = () => {
    difference(this.#remoteConfigClearCacheAtom).observe(async ({ current, previous }) => {
      if (previous !== undefined && current !== previous) {
        await this.#invalidateStorage({ remoteConfigClearCacheVersion: current })
        await this.#updateAll()
      }
    })
  }

  #setupTimers = () => {
    const jitters = {
      day: ms('3m'),
      hour: ms('15s'),
    }
    const getCurrentTime = this.#synchronizedTime.now
    const updatePrices = (granularity) => this.update.bind(this, granularity)

    const fetchPricesForGranularity = (granularity) => {
      fetchPricesInterval({
        func: updatePrices(granularity),
        abortController: this.#abortController,
        granularity,
        getJitter: () => jitters[granularity],
        getCurrentTime,
      })
    }

    fetchPricesForGranularity('day')
    fetchPricesForGranularity('hour')
  }

  start = async () => {
    if (this.#started) {
      return
    }

    this.#started = true
    this.#abortController = new AbortController()

    const remoteConfigClearCacheVersion = await this.#remoteConfigClearCacheAtom.get()
    await this.#invalidateStorage({ remoteConfigClearCacheVersion })
    this.#listenRemoteConfigClearCacheVersionChanges()

    const combinedAtom = combine({
      currency: this.#currencyAtom,
      enabledAssets: this.#enabledAssetsAtom,
    })

    await difference(combinedAtom).observe(({ current, previous = Object.create(null) }) => {
      const { currency, enabledAssets } = current
      const { currency: previousCurrency, enabledAssets: previousEnabledAssets } = previous
      if (!enabledAssets || Object.keys(enabledAssets).length === 0) return

      if (!this.#currency) {
        this.#currency = currency
        return this.#setupTimers()
      }

      if (currency !== previousCurrency) {
        this.#currency = currency
        this.#updateAll()
        return
      }

      const newAssetNames = Object.keys(enabledAssets).filter(
        (assetName) => !previousEnabledAssets[assetName]
      )
      if (newAssetNames.length > 0) {
        this.#updateNewAssets(newAssetNames)
      }
    })
  }

  stop = () => {
    if (!this.#started) {
      return
    }

    this.#started = false
    this.#abortController.abort()
  }

  #logResponseErrors = (response) => {
    if (response.requestErrors) {
      Object.keys(response.requestErrors).forEach((key) => {
        if (key !== 'invalidCryptoSymbols') {
          this.#logger.warn(`pricing-server: ${key}: `, response.requestErrors[key])
        }
      })
    }
  }

  // use it to fetch more prices than we fetch on `start` using granularityRequestLimits.
  // IMPORTANT: assume that initial prices are fetched already and this method is used only to fetch more older prices
  fetchAssetPricesFromDate = makeConcurrentByArguments(
    async ({ assetName, granularity, startTimestamp }) => {
      const currency = this.#currency
      const ticker = this.assetsModule.getAsset(assetName).ticker
      const startTime = dayjs.utc(startTimestamp).startOf(granularity)

      const cache = await this.#getCache({ currency, granularity, assetName })
      const oldestTimestampFromCache = getOldestTimestampFromCache(cache)
      if (!oldestTimestampFromCache) {
        this.#logger.error('trying to fetch more prices but initial prices are not fetched yet')
        throw new Error('trying to fetch more prices but initial prices are not fetched yet')
      }

      const endTimestamp = oldestTimestampFromCache

      if (endTimestamp <= startTime) {
        // if we have older price than we have all prices already
        return
      }

      const endTime = dayjs(endTimestamp)
      const limit = endTime.diff(startTime, granularity)

      if (limit <= 0) return

      const response = await this.#pricingClient.historicalPrice({
        assets: [ticker],
        fiatArray: [currency],
        granularity,
        limit,
        timestamp: endTimestamp / 1000,
        ignoreInvalidSymbols: true,
      })

      this.#logResponseErrors(response)

      const assetData = response[ticker][currency]

      const filteredAssetData = filterMapAssetDataFromServer(assetData)

      const sortedPrices = [...cache, ...filteredAssetData].sort((a, b) => a[0] - b[0])

      const updatedAssetHistoryMap = new Map(sortedPrices)

      await this.#setCache({
        currency,
        granularity,
        pricesByAssetName: {
          [assetName]: [...updatedAssetHistoryMap],
        },
      })

      await this.#marketHistoryAtom.set(async (current) => {
        const transformedPrices = transformPriceEntries([...updatedAssetHistoryMap])
        const mergedData = mergePricesInAtom({
          prices: {
            [assetName]: transformedPrices,
          },
          atomData: current?.data ?? Object.create(null),
          currency,
          parsedGranularity: parseGranularity(granularity),
        })

        return {
          data: mergedData,
        }
      })
    }
  )
}

const createMarketHistoryMonitor = (args = Object.create(null)) =>
  new MarketHistoryMonitor({ ...args })

const marketHistoryMonitorDefinition = {
  id: 'marketHistoryMonitor',
  type: 'module',
  factory: createMarketHistoryMonitor,
  dependencies: [
    'pricingClient',
    'currencyAtom',
    'storage',
    'assetsModule',
    'clearCacheAtom',
    'remoteConfigClearCacheAtom',
    'remoteConfigRefreshIntervalAtom',
    'enabledAssetsAtom',
    'marketHistoryAtom',
    'logger',
    'getCacheKey?',
    'config',
    'synchronizedTime',
  ],
  public: true,
}

export default marketHistoryMonitorDefinition
