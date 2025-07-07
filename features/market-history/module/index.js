import dayjs from '@exodus/dayjs'
import delay from 'delay'
import makeConcurrent, { byArguments as makeConcurrentByArguments } from 'make-concurrent'
import ms from 'ms'
import { createInMemoryAtom, difference } from '@exodus/atoms'
import { getAssetFromTicker, parseGranularity } from '../utils.js'
import fetchHistoricalPrices from './fetch-historical-prices.js'

const CLEAR_MARKET_HISTORY_CACHE_KEY = 'clear-market-history-cache'
const CLEAR_MARKET_HISTORY_CACHE_FROM_REMOTE_CONFIG_KEY =
  'clear-market-history-cache-from-remote-config'
const MARKET_HISTORY_REFRESH_KEY = 'market-history-cache-refresh'

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
  data.filter((item) => item.close !== 0).map((item) => [item.time * 1000, { close: item.close }])

const mapPricesForCache = (pricesMap, assetNames, assets) => {
  const result = Object.create(null)
  for (const assetName of assetNames) {
    const assetPricesMap = pricesMap.get(assets[assetName].ticker)
    result[assetName] = assetPricesMap ? [...assetPricesMap] : []
  }

  return result
}

const transformHistoricalPrices = (pricesMap, assetNames, assets) => {
  const result = Object.create(null)
  for (const assetName of assetNames) {
    const assetPrices = pricesMap.get(assets[assetName].ticker)
    if (assetPrices) {
      const closePrices = Object.create(null)
      // assetPrices is a Map, iterate it directly to avoid creating an intermediate array
      for (const [time, priceData] of assetPrices.entries()) {
        closePrices[time] = priceData.close
      }

      result[assetName] = closePrices
    } else {
      result[assetName] = Object.create(null)
    }
  }

  return result
}

const delayWithJitter = (ms, jitter = 0, signal) =>
  delay(Math.floor(ms + Math.random() * jitter), { signal })

const setupPriceFetchInterval = async ({
  func,
  abortController,
  granularity,
  getJitter = () => 0,
  delay = 0,
  getCurrentTime = () => Date.now(),
}) => {
  while (abortController ? !abortController.signal.aborted : true) {
    const now = getCurrentTime()
    const untilEndOfPeriod = dayjs.utc(now).endOf(granularity).valueOf() - now

    try {
      await delayWithJitter(untilEndOfPeriod + delay, getJitter(), abortController?.signal)
    } catch {
      // aborted
      break
    }

    try {
      await func()
    } catch (err) {
      console.error(err)
    }
  }
}

class MarketHistoryMonitor {
  #pricingClient
  #currencyAtom
  #currency = null
  #previouslyEnabledAssets = null
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
  #errorTracking
  #atomListeners = []

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
    errorTracking,
  }) {
    const { granularityRequestLimits } = config
    if (!granularityRequestLimits) {
      throw new Error('granularityRequestLimits required')
    }

    this.assetsModule = assetsModule
    this.storage = storage
    this.#pricingClient = pricingClient
    this.#errorTracking = errorTracking
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

  #isActive = false

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

  #fetch = async ({ currency, granularity, assetNames, requestLimit }) => {
    const assets = this.assetsModule.getAssets()
    const assetTickers = assetNames
      .filter((assetName) => !assets[assetName].isCombined)
      .map((assetName) => assets[assetName].ticker)
    const dynamicRefreshKey = `${granularity}-${currency}`
    const refreshKey = `${MARKET_HISTORY_REFRESH_KEY}-${dynamicRefreshKey}`
    const latestRefreshTimestamp = (await this.storage.get(refreshKey)) || 0
    const refreshIntervalMs = this.#remoteConfigRefreshIntervalAtom
      ? await this.#remoteConfigRefreshIntervalAtom.get()
      : null
    const timeSinceLastUpdate = this.#synchronizedTime.now() - latestRefreshTimestamp
    const ignoreCache =
      !!refreshIntervalMs &&
      !Number.isNaN(refreshIntervalMs) &&
      timeSinceLastUpdate > refreshIntervalMs
    if (ignoreCache) {
      await this.storage.set(refreshKey, this.#synchronizedTime.now())
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

    if (fetchedPricesMap.size > 0) {
      const pricesByAssetNameForCache = mapPricesForCache(fetchedPricesMap, assetNames, assets)
      await this.#setCache({
        currency,
        granularity,
        pricesByAssetName: pricesByAssetNameForCache,
      })
    }

    const fullHistoryByAssetName = transformHistoricalPrices(
      historicalPricesMap,
      assetNames,
      assets
    )

    return {
      prices: fullHistoryByAssetName,
      hasNewPrices: fetchedPricesMap.size > 0,
    }
  }

  #getEnabledAssetNames = async () => {
    const enabledAssets = await this.#enabledAssetsAtom.get()
    return Object.keys(enabledAssets)
  }

  update = async (granularity) => {
    this.#logger.info(`Update started (granularity=${granularity})`)
    const assetNames = await this.#getEnabledAssetNames()
    try {
      await this.#updateAssets(assetNames, [granularity])
    } catch (error) {
      this.#logger.error(`Update error (granularity=${granularity})`, error)
    }
  }

  updateAll = async () => {
    if (!this.#isActive) {
      const e = new Error('market-history updateAll cannot be called before module started')
      this.#errorTracking.track({
        error: e,
        namespace: 'marketHistory',
        context: { method: 'updateAll' },
      })
      throw e
    }

    if (!this.#currency) {
      const e = new Error('market-history updateAll cannot be called before currency is loaded')
      this.#errorTracking.track({
        error: e,
        namespace: 'marketHistory',
        context: { method: 'updateAll' },
      })
      throw e
    }

    this.#logger.info('Market history update all started')
    try {
      const assetNames = await this.#getEnabledAssetNames()
      await this.#updateAssets(assetNames, ['day', 'hour', 'minute'])
      this.#logger.info('Market history update all completed')
    } catch (error) {
      this.#errorTracking.track({
        error,
        namespace: 'marketHistory',
        context: { method: 'updateAll' },
      })
      this.#logger.error('Market history update all failed', error)
    }
  }

  #fetchPricesByGranularity = async ({ granularity, assetNames, currency }) => {
    const parsedGranularity = parseGranularity(granularity)
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

  #updateAssets = async (assetNames, granularities) => {
    if (!this.#isActive) {
      return
    }

    const currency = this.#currency
    const promises = granularities.map((granularity) =>
      this.#fetchPricesByGranularity({ granularity, assetNames, currency })
    )

    const results = await Promise.all(promises)

    if (!this.#isActive) {
      return
    }

    await this.#marketHistoryAtom.set((current) => {
      const detectHasChanges = (result, parsedGranularity) => {
        if (!current || !current.data) return true
        if (result.hasNewPrices) return true

        // simply check if any asset missing prices. if asset already exist in atom and updated it should be covered by previous condition
        return Object.keys(result.prices).some((assetName) => {
          if (!result.prices[assetName] || Object.values(result.prices[assetName]).length === 0)
            return false
          return !current?.data?.[currency]?.[parsedGranularity]?.[assetName]
        })
      }

      const hasChanges = granularities.some((granularity, index) => {
        const result = results[index]
        return result && detectHasChanges(result, parseGranularity(granularity))
      })

      if (!hasChanges) return current

      const data = {
        ...current?.data,
        [currency]: {
          daily: Object.create(null),
          hourly: Object.create(null),
          minutely: Object.create(null),
          ...current?.data?.[currency],
        },
      }

      granularities.forEach((granularity, index) => {
        const result = results[index]?.prices
        if (result) {
          const parsedGranularity = parseGranularity(granularity)

          data[currency][parsedGranularity] = {
            ...data[currency][parsedGranularity],
            ...result,
          }
        }
      })

      return {
        data,
      }
    })
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
    this.#atomListeners.push(
      difference(this.#remoteConfigClearCacheAtom).observe(({ current, previous }) => {
        const clear = async () => {
          await this.#invalidateStorage({ remoteConfigClearCacheVersion: current })

          if (!this.#isActive) {
            return
          }

          await this.updateAll()
        }

        if (previous !== undefined && current !== previous) {
          clear().catch((e) => {
            this.#errorTracking.track({
              error: e,
              namespace: 'marketHistory',
              context: { method: 'listenRemoteConfigClearCacheVersionChanges' },
            })
          })
        }
      })
    )
  }

  #setupTimers = () => {
    this.#logger.info('market history setupTimers')
    const jitters = {
      day: ms('3m'),
      hour: ms('15s'),
      minute: ms('10s'),
    }
    const getCurrentTime = this.#synchronizedTime.now
    const updatePrices = (granularity) => this.update.bind(this, granularity)

    const fetchPricesForGranularity = (granularity) => {
      setupPriceFetchInterval({
        func: updatePrices(granularity),
        abortController: this.#abortController,
        granularity,
        getJitter: () => jitters[granularity],
        getCurrentTime,
      })
    }

    fetchPricesForGranularity('day')
    fetchPricesForGranularity('hour')
    fetchPricesForGranularity('minute')
  }

  #listenCurrencyChanges = () => {
    const currencyListener = this.#currencyAtom.observe((currency) => {
      if (this.#currency !== currency) {
        this.#logger.info('market history update because currency changes', currency)
        this.#currency = currency
        this.#marketHistoryAtom.set((current) => {
          const data = current?.data || {}

          return {
            data: {
              ...data,
              [currency]: data[currency] || {
                daily: Object.create(null),
                hourly: Object.create(null),
                minutely: Object.create(null),
              },
            },
          }
        })
        if (!this.#isActive) {
          return
        }

        this.updateAll()
      }
    })
    this.#atomListeners.push(currencyListener)
  }

  #listenEnabledAssetsChanges = () => {
    const enabledAssetsListener = this.#enabledAssetsAtom.observe((enabledAssets) => {
      const newAssetNames = Object.keys(enabledAssets).filter(
        (assetName) => !this.#previouslyEnabledAssets[assetName]
      )
      this.#previouslyEnabledAssets = enabledAssets
      if (newAssetNames.length > 0) {
        this.#logger.info('market history update because new assets enabled', newAssetNames)
        this.#updateAssets(newAssetNames, ['day', 'hour', 'minute'])
      }
    })
    this.#atomListeners.push(enabledAssetsListener)
  }

  #initMarketHistoryAtom = async () => {
    await this.#marketHistoryAtom.set((current) => {
      if (current) return current

      return {
        data: {
          [this.#currency]: {
            daily: Object.create(null),
            hourly: Object.create(null),
            minutely: Object.create(null),
          },
        },
      }
    })
  }

  start = makeConcurrent(
    async () => {
      if (this.#isActive) return
      this.#logger.info('market history start')
      this.#isActive = true
      this.#abortController = new AbortController()

      const remoteConfigClearCacheVersion = await this.#remoteConfigClearCacheAtom.get()
      await this.#invalidateStorage({ remoteConfigClearCacheVersion })

      if (!this.#isActive) {
        return
      }

      this.#currency = await this.#currencyAtom.get()
      this.#previouslyEnabledAssets = await this.#enabledAssetsAtom.get()

      if (!this.#isActive) {
        return
      }

      // Initialize atom if necessary
      await this.#initMarketHistoryAtom()

      if (!this.#isActive) {
        return
      }

      this.#setupTimers()
      this.#listenRemoteConfigClearCacheVersionChanges()
      this.#listenCurrencyChanges()
      this.#listenEnabledAssetsChanges()

      if (!this.#isActive) {
        return
      }

      await this.updateAll()
    },
    { concurrency: 1 }
  )

  stop = () => {
    if (!this.#isActive) {
      return
    }

    this.#logger.info('market history stops')
    this.#atomListeners.forEach((unsubscribe) => unsubscribe())
    this.#atomListeners = []
    this.#isActive = false
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
        const transformedPrices = Object.fromEntries(
          [...updatedAssetHistoryMap].map(([time, priceData]) => [time, priceData.close])
        )
        const parsedGranularity = parseGranularity(granularity)

        return {
          data: {
            [currency]: {
              ...current?.data?.[currency],
              [parsedGranularity]: {
                ...current?.data?.[currency]?.[parsedGranularity],
                [assetName]: transformedPrices,
              },
            },
          },
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
    'errorTracking',
  ],
  public: true,
}

export default marketHistoryMonitorDefinition
