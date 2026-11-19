import dayjs from '@exodus/dayjs'
import delay from 'delay'
import makeConcurrent, { byArguments as makeConcurrentByArguments } from 'make-concurrent'
import ms from 'ms'
import { createInMemoryAtom, difference } from '@exodus/atoms'

import type { Definition } from '@exodus/dependency-types'

import type {
  Asset,
  AssetsAtom,
  CacheEntry,
  Granularity,
  MarketHistoryMonitor,
  MarketHistoryMonitorDependencies,
  MarketHistoryState,
  MarketHistoryStorage,
  PriceData,
  PriceRecord,
  PricingClient,
  ErrorTracking,
  GranularityPrices,
  MarketHistoryData,
} from '../types.js'
import { getAssetFromTicker, mapToArray, parseGranularity } from '../utils.js'

import fetchHistoricalPrices from './fetch-historical-prices.js'

import type { Atom, Logger, ReadonlyAtom } from '@exodus/atoms'

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
}: {
  storage: MarketHistoryStorage
  clearRuntimeCache: () => void
  clearCacheVersion: string | null
  remoteConfigClearCacheVersion: string | null
}) => {
  const clearCacheVersionInStorage = await storage.get(CLEAR_MARKET_HISTORY_CACHE_KEY)
  const clearCacheFromRemoteConfigVersionInStorage = await storage.get(
    CLEAR_MARKET_HISTORY_CACHE_FROM_REMOTE_CONFIG_KEY
  )
  const localAreEqual = !clearCacheVersion || clearCacheVersionInStorage === clearCacheVersion
  const remoteAreEqual =
    !remoteConfigClearCacheVersion ||
    clearCacheFromRemoteConfigVersionInStorage === remoteConfigClearCacheVersion

  if (localAreEqual && remoteAreEqual) return

  await storage.clear()
  clearRuntimeCache()

  return Promise.all([
    storage
      .set(CLEAR_MARKET_HISTORY_CACHE_KEY, clearCacheVersion || '')
      .catch((e: unknown) => console.warn(e)),
    storage
      .set(CLEAR_MARKET_HISTORY_CACHE_FROM_REMOTE_CONFIG_KEY, remoteConfigClearCacheVersion || '')
      .catch((e: unknown) => console.warn(e)),
  ])
}

const getCacheKeyDefault = ({
  currency,
  assetName,
  granularity,
}: {
  currency: string
  assetName: string
  granularity: Granularity
}): string => `prices-${currency}-${assetName}-${granularity}`

const getOldestTimestampFromCache = (cache: CacheEntry[]): number | null => {
  if (cache.length === 0) return null

  let min: number | null = null
  for (const item of cache) {
    const time = item[0]
    if (min === null || time < min) min = time
  }

  return min
}

const filterMapAssetDataFromServer = (data: { time: number; close: number }[]): CacheEntry[] => {
  const result: CacheEntry[] = []
  for (const item of data) {
    if (item.close !== 0) {
      result.push([item.time * 1000, { close: item.close }])
    }
  }

  return result
}

const mapPricesForCache = (
  fetchedPricesMap: Map<string, Map<number, PriceData>>,
  assetNames: string[],
  assets: Record<string, Asset>
): Record<string, CacheEntry[]> => {
  const result: Record<string, CacheEntry[]> = Object.create(null)
  for (const assetName of assetNames) {
    const map = fetchedPricesMap.get(assets[assetName]!.ticker)
    if (map) {
      result[assetName] = mapToArray(map)
    } else {
      result[assetName] = []
    }
  }

  return result
}

const transformHistoricalPrices = (
  pricesMap: Map<string, Map<number, PriceData>>,
  assetNames: string[],
  assets: Record<string, Asset>
): Record<string, PriceRecord> => {
  const result: Record<string, PriceRecord> = Object.create(null)
  for (const assetName of assetNames) {
    const assetPrices = pricesMap.get(assets[assetName]!.ticker)
    if (assetPrices) {
      const closePrices: PriceRecord = new Map()
      for (const [time, priceData] of assetPrices.entries()) {
        closePrices.set(time, priceData.close)
      }

      result[assetName] = closePrices
    } else {
      result[assetName] = new Map()
    }
  }

  return result
}

const delayWithJitter = (ms: number, jitter = 0, signal?: AbortSignal) =>
  delay(Math.floor(ms + Math.random() * jitter), { signal })

const setupPriceFetchInterval = async ({
  func,
  abortController,
  granularity,
  getJitter = () => 0,
  delay = 0,
  getCurrentTime = () => Date.now(),
}: {
  func: () => Promise<void>
  abortController?: AbortController
  granularity: Granularity
  getJitter?: () => number
  delay?: number
  getCurrentTime?: () => number
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

class MarketHistoryMonitorImpl {
  #pricingClient: PricingClient
  #currencyAtom: Atom<string>
  #currency: string | null = null
  #previouslyEnabledAssets: Record<string, Asset> | null = null
  #getCacheKey: typeof getCacheKeyDefault = getCacheKeyDefault
  #remoteConfigRefreshIntervalAtom: ReadonlyAtom<number | null> | null = null
  #clearCacheAtom: Atom<string | null>
  #remoteConfigClearCacheAtom: Atom<string | null>
  #runtimeCache = new Map<string, CacheEntry[]>()
  #marketHistoryAtom: Atom<MarketHistoryState | undefined>
  #enabledAssetsAtom: ReadonlyAtom<Record<string, Asset>>
  #granularityRequestLimits: Record<Granularity, number>
  #logger: Logger
  #abortController = new AbortController()
  #synchronizedTime: { now: () => number }
  #errorTracking: ErrorTracking
  #atomListeners: (() => void)[] = []
  #assetsAtom: AssetsAtom

  storage: MarketHistoryStorage

  constructor({
    assetsAtom,
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
  }: MarketHistoryMonitorDependencies) {
    const { granularityRequestLimits } = config!
    if (!granularityRequestLimits) {
      throw new Error('granularityRequestLimits required')
    }

    this.storage = storage
    this.#assetsAtom = assetsAtom
    this.#pricingClient = pricingClient
    this.#errorTracking = errorTracking
    this.#getCacheKey = getCacheKey!
    this.#remoteConfigRefreshIntervalAtom = remoteConfigRefreshIntervalAtom ?? null
    this.#clearCacheAtom = clearCacheAtom!
    this.#remoteConfigClearCacheAtom = remoteConfigClearCacheAtom!
    this.#currencyAtom = currencyAtom
    this.#enabledAssetsAtom = enabledAssetsAtom
    this.#marketHistoryAtom = marketHistoryAtom
    this.#logger = logger
    this.#granularityRequestLimits = granularityRequestLimits
    this.#synchronizedTime = synchronizedTime
  }

  #isActive = false

  // Read through a method so each call is opaque to TS narrowing — stop() may flip
  // the flag during awaits, and we need the post-await checks to actually run.
  #stillActive(): boolean {
    return this.#isActive
  }

  #setCache = async ({
    currency,
    granularity,
    pricesByAssetName,
  }: {
    currency: string
    granularity: Granularity
    pricesByAssetName: Record<string, CacheEntry[]>
  }) => {
    const assetNamesWithChanges: string[] = []
    const changes: Record<string, CacheEntry[]> = Object.create(null)
    for (const assetName of Object.keys(pricesByAssetName)) {
      const values = pricesByAssetName[assetName]!
      if (values.length > 0) {
        const key = this.#getCacheKey({ currency, assetName, granularity })
        assetNamesWithChanges.push(assetName)
        changes[key] = values
        this.#runtimeCache.set(key, values)
      }
    }

    if (assetNamesWithChanges.length === 0) return

    await this.storage.batchSet(changes)
    await this.#extendCacheIndex(currency, assetNamesWithChanges)
  }

  #cacheIndexKey = (currency: string): string => `cached-assets-${currency}`

  // Serialized to keep the get -> mutate -> set sequence atomic across
  // concurrent #setCache callers (parallel granularities, fetchAssetPricesFromDate).
  #extendCacheIndex = makeConcurrent(
    async (currency: string, addedAssetNames: string[]): Promise<void> => {
      const indexKey = this.#cacheIndexKey(currency)
      const existing = ((await this.storage.get(indexKey)) || []) as string[]
      const existingSet = new Set(existing)
      let added = 0
      for (const name of addedAssetNames) {
        if (!existingSet.has(name)) {
          existingSet.add(name)
          added += 1
        }
      }

      if (added === 0) return
      await this.storage.set(indexKey, [...existingSet])
    },
    { concurrency: 1 }
  )

  #getCache = async ({
    currency,
    granularity,
    assetName,
  }: {
    currency: string
    granularity: Granularity
    assetName: string
  }): Promise<CacheEntry[]> => {
    const key = this.#getCacheKey({ currency, assetName, granularity })
    const cachedValue = this.#runtimeCache.get(key)
    if (cachedValue) {
      return cachedValue
    }

    const cache = ((await this.storage.get(key)) || []) as CacheEntry[]
    this.#runtimeCache.set(key, cache)

    return cache
  }

  #makeRuntimeCacheKeyGetter =
    (assets: Record<string, Asset>) =>
    ({
      fiatTicker,
      granularity,
      assetTicker,
    }: {
      fiatTicker: string
      granularity: Granularity
      assetTicker: string
    }): string =>
      this.#getCacheKey({
        currency: fiatTicker,
        granularity,
        assetName: getAssetFromTicker(assets, assetTicker).name,
      })

  #fetch = async ({
    currency,
    granularity,
    assetNames,
  }: {
    currency: string
    granularity: Granularity
    assetNames: string[]
  }) => {
    const { value: assets } = await this.#assetsAtom.get()
    const assetTickers = assetNames
      .filter((assetName: string) => !assets[assetName]!.isCombined)
      .map((assetName: string) => assets[assetName]!.ticker)
    const dynamicRefreshKey = `${granularity}-${currency}`
    const refreshKey = `${MARKET_HISTORY_REFRESH_KEY}-${dynamicRefreshKey}`
    const latestRefreshTimestamp = ((await this.storage.get(refreshKey)) || 0) as number
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
      api: (params) => this.#pricingClient.historicalPrice(params),
      assetTickers,
      fiatTicker: currency,
      granularity,
      ignoreInvalidSymbols: true,
      getCurrentTime: this.#synchronizedTime.now,
      getCacheFromStorage: async (ticker: string) =>
        this.#getCache({
          currency,
          granularity,
          assetName: getAssetFromTicker(assets, ticker).name,
        }),
      ignoreCache,
      runtimeCache: this.#runtimeCache,
      getRuntimeCacheKey: this.#makeRuntimeCacheKeyGetter(assets),
      requestLimit: this.#granularityRequestLimits[granularity],
    })

    if (fetchedPricesMap.size > 0) {
      const pricesByAssetNameForCache = mapPricesForCache(fetchedPricesMap, assetNames, assets)
      await this.#setCache({
        currency,
        granularity,
        pricesByAssetName: pricesByAssetNameForCache,
      })
    }

    const assetNamesWithPrices: string[] = []
    for (const assetName of assetNames) {
      const history = historicalPricesMap.get(assets[assetName]!.ticker)
      if (history && history.size > 0) {
        assetNamesWithPrices.push(assetName)
      }
    }

    return {
      getPrices: () => transformHistoricalPrices(historicalPricesMap, assetNames, assets),
      assetNamesWithPrices,
      hasNewPrices: fetchedPricesMap.size > 0,
    }
  }

  #getEnabledAssetNames = async (): Promise<string[]> => {
    const enabledAssets = await this.#enabledAssetsAtom.get()
    return Object.keys(enabledAssets)
  }

  update = async (granularity: Granularity) => {
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
        context: { method: 'updateAll' },
      })
      throw e
    }

    if (!this.#currency) {
      const e = new Error('market-history updateAll cannot be called before currency is loaded')
      this.#errorTracking.track({
        error: e,
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
        context: { method: 'updateAll' },
      })
      this.#logger.error('Market history update all failed', error)
    }
  }

  fetchAssets = async (
    assetNames: string[],
    granularities: Granularity[] = ['day', 'hour', 'minute']
  ) => {
    if (!this.#isActive) {
      const e = new Error('market-history fetchAssets cannot be called before module started')
      this.#errorTracking.track({
        error: e,
        context: { method: 'fetchAssets' },
      })
      throw e
    }

    if (!this.#currency) {
      const e = new Error('market-history fetchAssets cannot be called before currency is loaded')
      this.#errorTracking.track({
        error: e,
        context: { method: 'fetchAssets' },
      })
      throw e
    }

    try {
      await this.#updateAssets(assetNames, granularities)
    } catch (error) {
      this.#errorTracking.track({
        error,
        context: { method: 'fetchAssets' },
      })
      this.#logger.error('market-history fetchAssets failed', error)
    }
  }

  #fetchPricesByGranularity = async ({
    granularity,
    assetNames,
    currency,
  }: {
    granularity: Granularity
    assetNames: string[]
    currency: string
  }) => {
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

  #updateAssets = async (assetNames: string[], granularities: Granularity[]) => {
    if (!this.#isActive) {
      return
    }

    const currency = this.#currency!
    const promises = granularities.map((granularity) =>
      this.#fetchPricesByGranularity({ granularity, assetNames, currency })
    )

    const results = await Promise.all(promises)

    if (!this.#stillActive()) {
      return
    }

    await this.#marketHistoryAtom.set((current: MarketHistoryState | undefined) => {
      const detectHasChanges = (
        result: { hasNewPrices: boolean; assetNamesWithPrices: string[] },
        parsedGranularity: string
      ) => {
        if (!current?.data) return true
        if (result.hasNewPrices) return true

        // simply check if any asset missing prices. if asset already exist in atom and updated it should be covered by previous condition
        return result.assetNamesWithPrices.some(
          (assetName: string) =>
            !current.data[currency]?.[parsedGranularity as keyof GranularityPrices]?.[assetName]
        )
      }

      const hasChanges = granularities.some((granularity, index) => {
        const result = results[index]
        return result && detectHasChanges(result, parseGranularity(granularity))
      })

      if (!hasChanges) return current

      const data: MarketHistoryData = {
        ...current?.data,
        [currency]: {
          daily: Object.create(null),
          hourly: Object.create(null),
          minutely: Object.create(null),
          ...current?.data[currency],
        },
      }

      granularities.forEach((granularity, index) => {
        const result = results[index]
        if (result) {
          const parsedGranularity = parseGranularity(granularity)
          if (!detectHasChanges(result, parsedGranularity)) return
          const prices = result.getPrices()
          const currencyData = data[currency]!
          const existing = currencyData[parsedGranularity]
          if (existing) {
            currencyData[parsedGranularity] = Object.assign(Object.create(null), existing, prices)
          } else {
            currencyData[parsedGranularity] = prices
          }
        }
      })

      return {
        data,
      }
    })
  }

  #invalidateStorage = async ({
    remoteConfigClearCacheVersion,
  }: {
    remoteConfigClearCacheVersion: string | null
  }) => {
    const clearCacheVersion = await this.#clearCacheAtom.get()
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
          clear().catch((e: unknown) => {
            this.#errorTracking.track({
              error: e,
              context: { method: 'listenRemoteConfigClearCacheVersionChanges' },
            })
          })
        }
      })
    )
  }

  #setupTimers = () => {
    this.#logger.info('market history setupTimers')
    const jitters: Record<Granularity, number> = {
      day: ms('3m'),
      hour: ms('15s'),
      minute: ms('10s'),
    }
    const getCurrentTime = this.#synchronizedTime.now
    const updatePrices = (granularity: Granularity) => this.update.bind(this, granularity)

    const fetchPricesForGranularity = (granularity: Granularity) => {
      void setupPriceFetchInterval({
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
    const currencyListener = this.#currencyAtom.observe((currency: string) => {
      if (this.#currency !== currency) {
        this.#logger.info('market history update because currency changes', currency)
        this.#currency = currency
        void this.#marketHistoryAtom.set((current: MarketHistoryState | undefined) => {
          const data = current?.data || Object.create(null)

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

        void this.updateAll()
      }
    })
    this.#atomListeners.push(currencyListener)
  }

  #listenEnabledAssetsChanges = () => {
    const enabledAssetsListener = this.#enabledAssetsAtom.observe(
      (enabledAssets: Record<string, Asset>) => {
        const newAssetNames = Object.keys(enabledAssets).filter(
          (assetName) => !this.#previouslyEnabledAssets![assetName]
        )
        this.#previouslyEnabledAssets = enabledAssets
        if (newAssetNames.length > 0) {
          this.#logger.info('market history update because new assets enabled', newAssetNames)
          void this.#updateAssets(newAssetNames, ['day', 'hour', 'minute'])
        }
      }
    )
    this.#atomListeners.push(enabledAssetsListener)
  }

  #initMarketHistoryAtom = async () => {
    await this.#marketHistoryAtom.set((current: MarketHistoryState | undefined) => {
      if (current?.data) return current

      return {
        data: {
          [this.#currency!]: {
            daily: Object.create(null),
            hourly: Object.create(null),
            minutely: Object.create(null),
          },
        },
      }
    })
  }

  #hydratePromise: Promise<void> | null = null

  hydrate = (): Promise<void> => {
    this.#hydratePromise ??= this.#performHydrate()
    return this.#hydratePromise
  }

  #performHydrate = async (): Promise<void> => {
    const currency = await this.#currencyAtom.get()
    const indexed = ((await this.storage.get(this.#cacheIndexKey(currency))) || []) as string[]
    if (indexed.length === 0) return

    const granularities: Granularity[] = ['day', 'hour', 'minute']
    const keys: string[] = []
    const meta: { assetName: string; granularity: Granularity }[] = []
    for (const assetName of indexed) {
      for (const granularity of granularities) {
        keys.push(this.#getCacheKey({ currency, assetName, granularity }))
        meta.push({ assetName, granularity })
      }
    }

    const results = (await this.storage.batchGet(keys)) as (CacheEntry[] | undefined)[]

    const granularityPrices: GranularityPrices = {
      daily: Object.create(null),
      hourly: Object.create(null),
      minutely: Object.create(null),
    }

    let hydratedCount = 0
    results.forEach((cacheEntries, index) => {
      if (!cacheEntries || cacheEntries.length === 0) return

      const { assetName, granularity } = meta[index]!
      const key = keys[index]!

      this.#runtimeCache.set(key, cacheEntries)

      const priceRecord: PriceRecord = new Map()
      for (const [time, { close }] of cacheEntries) {
        priceRecord.set(time, close)
      }

      const parsedGranularity = parseGranularity(granularity)
      granularityPrices[parsedGranularity]![assetName] = priceRecord
      hydratedCount += 1
    })

    if (hydratedCount === 0) return

    await this.#marketHistoryAtom.set((current: MarketHistoryState | undefined) => {
      if (current?.data[currency]) return current

      return {
        data: {
          ...current?.data,
          [currency]: granularityPrices,
        },
      }
    })

    this.#logger.info(`market history hydrated from cache (currency=${currency})`)
  }

  start = makeConcurrent(
    async () => {
      if (this.#isActive) return
      this.#logger.info('market history start')
      this.#isActive = true
      this.#abortController = new AbortController()

      await this.hydrate().catch((error: unknown) => {
        this.#logger.error('market history hydrate failed', error)
      })

      if (!this.#stillActive()) {
        return
      }

      const remoteConfigClearCacheVersion = await this.#remoteConfigClearCacheAtom.get()
      await this.#invalidateStorage({ remoteConfigClearCacheVersion })

      if (!this.#stillActive()) {
        return
      }

      this.#currency = await this.#currencyAtom.get()
      this.#previouslyEnabledAssets = await this.#enabledAssetsAtom.get()

      if (!this.#stillActive()) {
        return
      }

      // Initialize atom if necessary
      await this.#initMarketHistoryAtom()

      if (!this.#stillActive()) {
        return
      }

      this.#setupTimers()
      this.#listenRemoteConfigClearCacheVersionChanges()
      this.#listenCurrencyChanges()
      this.#listenEnabledAssetsChanges()

      if (!this.#stillActive()) {
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

  #logResponseErrors = (response: { requestErrors?: Record<string, string[]> }) => {
    if (response.requestErrors) {
      Object.keys(response.requestErrors).forEach((key: string) => {
        if (key !== 'invalidCryptoSymbols') {
          this.#logger.warn(`pricing-server: ${key}: `, response.requestErrors![key])
        }
      })
    }
  }

  // use it to fetch more prices than we fetch on `start` using granularityRequestLimits.
  // IMPORTANT: assume that initial prices are fetched already and this method is used only to fetch more older prices
  fetchAssetPricesFromDate = makeConcurrentByArguments(
    async ({
      assetName,
      granularity,
      startTimestamp,
    }: {
      assetName: string
      granularity: Granularity
      startTimestamp: number
    }) => {
      const currency = this.#currency!
      const { value: assets } = await this.#assetsAtom.get()
      const ticker = assets[assetName]!.ticker
      const startTime = dayjs.utc(startTimestamp).startOf(granularity)

      const cache = await this.#getCache({ currency, granularity, assetName })
      const oldestTimestampFromCache = getOldestTimestampFromCache(cache)
      if (!oldestTimestampFromCache) {
        this.#logger.error('trying to fetch more prices but initial prices are not fetched yet')
        throw new Error('trying to fetch more prices but initial prices are not fetched yet')
      }

      const endTimestamp = oldestTimestampFromCache

      if (endTimestamp <= startTime.valueOf()) {
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

      const assetData = response[ticker]![currency]!

      const filteredAssetData = filterMapAssetDataFromServer(assetData)

      const updatedAssetHistoryMap = new Map(cache)
      for (const [time, value] of filteredAssetData) {
        updatedAssetHistoryMap.set(time, value)
      }

      await this.#setCache({
        currency,
        granularity,
        pricesByAssetName: {
          [assetName]: mapToArray(updatedAssetHistoryMap),
        },
      })

      await this.#marketHistoryAtom.set(async (current: MarketHistoryState | undefined) => {
        const transformedPrices: PriceRecord = new Map()
        for (const [time, priceData] of updatedAssetHistoryMap.entries()) {
          transformedPrices.set(time, priceData.close)
        }

        const parsedGranularity = parseGranularity(granularity)

        return {
          data: {
            [currency]: {
              ...current?.data[currency],
              [parsedGranularity]: {
                ...current?.data[currency]?.[parsedGranularity],
                [assetName]: transformedPrices,
              },
            },
          },
        }
      })
    }
  )
}

const createMarketHistoryMonitor = (args: MarketHistoryMonitorDependencies): MarketHistoryMonitor =>
  new MarketHistoryMonitorImpl({ ...args })

const marketHistoryMonitorDefinition = {
  id: 'marketHistoryMonitor',
  type: 'module',
  factory: createMarketHistoryMonitor,
  dependencies: [
    'pricingClient',
    'currencyAtom',
    'storage',
    'assetsAtom',
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
} as const satisfies Definition

export default marketHistoryMonitorDefinition
