import { difference, memoize, pDebounce } from '@exodus/basic-utils'
import type { Atom, Unsubscribe } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'
import type { Logger } from '@exodus/logger'
import makeConcurrent from 'make-concurrent'
import ms from 'ms'

import type { RatesByCurrency, RateByAssetTicker, Rate } from '../redux/types.js'

type Asset = {
  name: string
  ticker: string
  isCombined?: boolean
}

type CurrentPriceResponse = {
  isModified: boolean
  lastModified: string | undefined
  data: Record<string, Record<string, number>>
}

type TickerResponse = Record<string, Record<string, { c24h?: number; v24h?: number; mc?: number }>>

type RealTimePriceResponse = {
  isModified: boolean
  lastModified: string | undefined
  entityTag: string | undefined
  data: Record<string, Record<string, number>>[]
}

type PricingClient = {
  currentPrice(params: {
    assets: string[]
    fiatCurrency: string
    lastModified?: string
  }): Promise<CurrentPriceResponse>
  ticker(params: { assets: string[]; fiatCurrency: string }): Promise<TickerResponse>
  realTimePrice(params: {
    fiatCurrency: string
    ignoreInvalidSymbols: boolean
    lastModified?: string
    entityTag?: string
  }): Promise<RealTimePriceResponse>
}

type ErrorTracking = {
  track(params: { error: unknown }): void
}

type FiatCurrencyOverrides = Record<string, string>

type Config = {
  fetchInterval: number
  debounceInterval: number
  fetchRealTimePricesInterval: number
  fiatCurrencyOverrides?: FiatCurrencyOverrides
}

type NormalizeOpts = {
  canBeNegative?: boolean
  zeroIsNotNull?: boolean
}

const TEMPORARY_TICKER_TTL = ms('5m')
const MAX_CURRENT_PRICE_CONTEXTS = 32

const INVALID_RATE: Rate = {
  invalid: true,
  price: 0,
  priceUSD: 0,
  change24: 0,
  volume24: 0,
  cap: 0,
}

const normalizeValue = (
  value: number | null | undefined,
  opts: NormalizeOpts = Object.create(null)
): number | null => {
  if (value == null) return null
  if (!opts.canBeNegative && value < 0) return null
  if (value === 0 && !opts.zeroIsNotNull) return null
  if (!Number.isFinite(value)) return null
  return value
}

function buildSlowRates({
  tickers,
  fiatCurrency,
  currentPriceResponse,
  tickerResponse,
}: {
  tickers: string[]
  fiatCurrency: string
  currentPriceResponse: Record<string, Record<string, number>>
  tickerResponse: TickerResponse
}): Record<string, Rate> {
  const slowRates: Record<string, Rate> = Object.create(null)
  for (const ticker of tickers) {
    const price = normalizeValue(currentPriceResponse[ticker]?.[fiatCurrency])
    const priceUSD = normalizeValue(currentPriceResponse[ticker]?.['USD'])
    const change24 =
      normalizeValue(tickerResponse[ticker]?.[fiatCurrency]?.c24h, { canBeNegative: true }) || 0
    const volume24 = normalizeValue(tickerResponse[ticker]?.[fiatCurrency]?.v24h) || 0
    const cap = normalizeValue(tickerResponse[ticker]?.[fiatCurrency]?.mc) || 0
    slowRates[ticker] = {
      price: price || 0,
      priceUSD: priceUSD || 0,
      change24,
      volume24,
      cap,
      invalid: price === null || priceUSD === null || price === 0 || priceUSD === 0,
    }
  }

  return slowRates
}

function getTicker(asset?: Asset) {
  return asset && !asset.isCombined ? asset.ticker : undefined
}

type RatesMonitorDependencies = {
  currencyAtom: Atom<string>
  pricingClient: PricingClient
  assetsAtom: Atom<{ value: Record<string, Asset> }>
  ratesAssetNamesToMonitorAtom: Atom<string[]>
  logger: Logger
  ratesAtom: Atom<RatesByCurrency>
  config: Config
  errorTracking: ErrorTracking
}

class RatesMonitor {
  #pricingClient: PricingClient
  #currencyAtom: Atom<string>
  #assetsAtom: Atom<{ value: Record<string, Asset> }>
  #ratesAssetNamesToMonitorAtom: Atom<string[]>
  #fetchInterval: number
  #debounceInterval: number
  #fetchRealTimePricesInterval: number
  #fiatCurrencyOverrides: FiatCurrencyOverrides
  #slowRatesByFiat: RatesByCurrency = Object.create(null)
  #temporaryTickers = new Map<string, number>()
  #expiryTimeoutId: ReturnType<typeof setTimeout> | null = null
  #generation = 0
  #requestId = 0
  #latestAppliedRequestIdsByFiat: Record<string, Record<string, number>> = Object.create(null)
  #needsPublish = false
  #rates: RatesByCurrency = Object.create(null)
  #realTimeRatesByFiat: Record<string, { data: Record<string, number> }> = Object.create(null)
  #ratesAtom: Atom<RatesByCurrency>
  #subscriptions: Unsubscribe[] = []
  #started = false
  #slowFetchesInFlight = new Set<string>()
  #realTimeFetchesInFlight = new Set<string>()
  #slowIntervalId: ReturnType<typeof setInterval> | null = null
  #realTimeIntervalId: ReturnType<typeof setInterval> | null = null
  #currentPriceContexts = new Map<string, { tickers: string[]; lastModified: string | undefined }>()

  #lastRealTimeCtxByFiat: Record<
    string,
    { lastModified: string | undefined; entityTag: string | undefined }
  > = Object.create(null)

  #logger: Logger
  #errorTracking: ErrorTracking
  #prevAssetNames: string[] = []

  _update: (this: RatesMonitor) => Promise<void>
  _fetchSlowRatesConcurrent: (opts?: { tickers: string[] }) => Promise<boolean>

  constructor({
    currencyAtom,
    pricingClient,
    assetsAtom,
    ratesAssetNamesToMonitorAtom,
    logger,
    ratesAtom,
    config,
    errorTracking,
  }: RatesMonitorDependencies) {
    this.#currencyAtom = currencyAtom
    this.#pricingClient = pricingClient
    this.#assetsAtom = assetsAtom
    this.#ratesAssetNamesToMonitorAtom = ratesAssetNamesToMonitorAtom
    this.#logger = logger
    this.#ratesAtom = ratesAtom
    this.#errorTracking = errorTracking
    this.#fetchInterval = config.fetchInterval
    this.#debounceInterval = config.debounceInterval
    this.#fetchRealTimePricesInterval = config.fetchRealTimePricesInterval
    this.#fiatCurrencyOverrides = config.fiatCurrencyOverrides ?? Object.create(null)

    this._update = pDebounce(this._updateInstant, this.#debounceInterval)
    this._fetchSlowRatesConcurrent = makeConcurrent(
      (...args: [{ tickers: string[] }?]) => this.#fetchSlowRates(...args),
      { concurrency: 1 }
    )
  }

  #getAvailableAssetTickers = async (): Promise<string[]> => {
    const assetNames = await this.#ratesAssetNamesToMonitorAtom.get()
    const { value: assets } = await this.#assetsAtom.get()
    return assetNames
      .map((assetName) => getTicker(assets[assetName]))
      .filter((ticker): ticker is string => !!ticker)
      .sort((a, b) => a.localeCompare(b))
  }

  async #getMonitoredTickers(): Promise<string[]> {
    const availableTickers = new Set(await this.#getAvailableAssetTickers())
    const expiredTickers = new Set<string>()
    for (const [ticker, expiresAt] of this.#temporaryTickers) {
      // Available assets take ownership before expiry so promotion never drops their cached rates.
      if (availableTickers.has(ticker) || expiresAt <= Date.now()) {
        this.#temporaryTickers.delete(ticker)
        this.#logMissing.reset()
        if (!availableTickers.has(ticker)) {
          expiredTickers.add(ticker)
          for (const [currency, { data }] of Object.entries(this.#realTimeRatesByFiat)) {
            if (Object.hasOwn(data, ticker)) {
              delete data[ticker]
              // A pruned payload no longer represents the complete response identified by its ETag.
              delete this.#lastRealTimeCtxByFiat[currency]
            }
          }
        }
      }
    }

    const tickers = new Set([...availableTickers, ...this.#temporaryTickers.keys()])
    for (const rates of Object.values(this.#slowRatesByFiat)) {
      for (const ticker of expiredTickers) delete rates[ticker]
    }

    for (const latestApplied of Object.values(this.#latestAppliedRequestIdsByFiat)) {
      for (const ticker of expiredTickers) delete latestApplied[ticker]
    }

    for (const [currency, rates] of Object.entries(this.#rates)) {
      const retainedRates = Object.fromEntries(
        Object.entries(rates).filter(([ticker]) => tickers.has(ticker))
      )
      if (Object.keys(retainedRates).length !== Object.keys(rates).length) {
        this.#rates = { ...this.#rates, [currency]: retainedRates }
        this.#needsPublish = true
      }
    }

    for (const [key, context] of this.#currentPriceContexts) {
      if (context.tickers.some((ticker) => expiredTickers.has(ticker))) {
        this.#currentPriceContexts.delete(key)
      }
    }

    this.#scheduleExpiry()
    return [...tickers].sort((a, b) => a.localeCompare(b))
  }

  #scheduleExpiry(): void {
    if (this.#expiryTimeoutId) clearTimeout(this.#expiryTimeoutId)
    this.#expiryTimeoutId = null
    if (!this.#started || this.#temporaryTickers.size === 0) return
    let expiresAt = Number.POSITIVE_INFINITY
    for (const expiry of this.#temporaryTickers.values()) expiresAt = Math.min(expiresAt, expiry)
    this.#expiryTimeoutId = setTimeout(
      () => {
        this.#expiryTimeoutId = null
        void this.#pruneAndPublish().catch((error) => this.#logger.error(error))
      },
      Math.max(0, expiresAt - Date.now())
    )
  }

  #getCurrency = async (): Promise<string> => this.#currencyAtom.get()

  #getApiFiatCurrency = (fiatCurrency: string): string =>
    this.#fiatCurrencyOverrides[fiatCurrency] ?? fiatCurrency

  async #fetchSlowRates({
    tickers: requestedTickers,
    throwOnError = false,
  }: { tickers?: string[]; throwOnError?: boolean } = {}): Promise<boolean> {
    const generation = this.#generation
    const fiatCurrency = await this.#getCurrency()
    if (generation !== this.#generation) return false
    if (!requestedTickers) {
      if (this.#slowFetchesInFlight.has(fiatCurrency)) return false
      this.#slowFetchesInFlight.add(fiatCurrency)
    }

    try {
      const monitoredTickers = new Set(await this.#getMonitoredTickers())
      const tickers = [
        ...new Set(
          requestedTickers?.filter((ticker) => monitoredTickers.has(ticker)) ?? monitoredTickers
        ),
      ].sort((a, b) => a.localeCompare(b))
      if (tickers.length === 0 || generation !== this.#generation) return false
      const requestId = ++this.#requestId
      const latestApplied = (this.#latestAppliedRequestIdsByFiat[fiatCurrency] ??=
        Object.create(null))
      const apiFiatCurrency = this.#getApiFiatCurrency(fiatCurrency)
      const contextKey = JSON.stringify([fiatCurrency, tickers])
      const context = this.#currentPriceContexts.get(contextKey)
      if (context) {
        this.#currentPriceContexts.delete(contextKey)
        this.#currentPriceContexts.set(contextKey, context)
      }

      const lastModified = context?.lastModified
      const [currentPriceRes, tickerResponse] = await Promise.all([
        this.#pricingClient.currentPrice({
          assets: tickers,
          fiatCurrency: apiFiatCurrency,
          lastModified,
        }),
        this.#pricingClient.ticker({ assets: tickers, fiatCurrency: apiFiatCurrency }),
      ])
      if (generation !== this.#generation) return false
      const activeTickers = new Set(await this.#getMonitoredTickers())
      if (generation !== this.#generation) return false
      if (!currentPriceRes.isModified) {
        this.#logger.info('price data is not modified, skipping slow-rates update tick')
        return false
      }

      const freshTickers = tickers.filter(
        (ticker) => activeTickers.has(ticker) && (latestApplied[ticker] ?? 0) < requestId
      )
      if (freshTickers.length === tickers.length) {
        this.#currentPriceContexts.delete(contextKey)
        this.#currentPriceContexts.set(contextKey, {
          tickers,
          lastModified: currentPriceRes.lastModified,
        })
        // Search subsets can form arbitrarily many combinations even before their tickers expire.
        if (this.#currentPriceContexts.size > MAX_CURRENT_PRICE_CONTEXTS) {
          const oldestKey = this.#currentPriceContexts.keys().next().value!
          this.#currentPriceContexts.delete(oldestKey)
        }
      }

      this.#slowRatesByFiat[fiatCurrency] = {
        ...this.#slowRatesByFiat[fiatCurrency],
        ...buildSlowRates({
          tickers: freshTickers,
          fiatCurrency: apiFiatCurrency,
          currentPriceResponse: currentPriceRes.data,
          tickerResponse,
        }),
      }
      for (const ticker of freshTickers) latestApplied[ticker] = requestId
      return freshTickers.length > 0
    } catch (error) {
      this.#logger.warn(`Failed to fetch slow rates: ${(error as Error).message}`)
      if (throwOnError) throw error
      return false
    } finally {
      if (!requestedTickers && generation === this.#generation) {
        this.#slowFetchesInFlight.delete(fiatCurrency)
      }
    }
  }

  async #fetchRealTimeRates(): Promise<boolean> {
    const generation = this.#generation
    const fiatCurrency = await this.#getCurrency()
    if (generation !== this.#generation || this.#realTimeFetchesInFlight.has(fiatCurrency)) {
      return false
    }

    this.#realTimeFetchesInFlight.add(fiatCurrency)
    let changed = false
    try {
      const apiFiatCurrency = this.#getApiFiatCurrency(fiatCurrency)
      const oldCtx = this.#lastRealTimeCtxByFiat[fiatCurrency] || {
        lastModified: undefined,
        entityTag: undefined,
      }
      const realTimeRes = await this.#pricingClient.realTimePrice({
        fiatCurrency: apiFiatCurrency,
        ignoreInvalidSymbols: true,
        lastModified: oldCtx.lastModified,
        entityTag: oldCtx.entityTag,
      })
      if (generation !== this.#generation) return false
      if (realTimeRes.isModified) {
        this.#realTimeRatesByFiat[fiatCurrency] = {
          data: realTimeRes.data.reduce(
            (acc, next) => {
              const ticker = Object.keys(next)[0]!
              acc[ticker] = next[ticker]![apiFiatCurrency]!
              return acc
            },
            Object.create(null) as Record<string, number>
          ),
        }
        this.#lastRealTimeCtxByFiat[fiatCurrency] = {
          lastModified: realTimeRes.lastModified,
          entityTag: realTimeRes.entityTag,
        }
        changed = true
      } else {
        this.#logger.info(
          `real-time data is not modified, skipping real-time update for ${fiatCurrency}`
        )
      }
    } catch (error) {
      this.#logger.warn(`Failed to fetch real-time pricing: ${(error as Error).message}`)
    } finally {
      if (generation === this.#generation) this.#realTimeFetchesInFlight.delete(fiatCurrency)
    }

    return changed
  }

  async fetchTickers(tickers: string[]): Promise<void> {
    if (!this.#started || tickers.length === 0) return
    const generation = this.#generation
    const expiresAt = Date.now() + TEMPORARY_TICKER_TTL
    const availableTickers = new Set(await this.#getAvailableAssetTickers())
    if (generation !== this.#generation) return
    const requestedTickers = [...new Set(tickers)].sort((a, b) => a.localeCompare(b))
    for (const ticker of requestedTickers) {
      if (!availableTickers.has(ticker)) {
        this.#temporaryTickers.set(
          ticker,
          Math.max(this.#temporaryTickers.get(ticker) ?? 0, expiresAt)
        )
      }
    }

    this.#scheduleExpiry()
    await this.#fetchSlowRates({ tickers: requestedTickers, throwOnError: true })
    if (generation === this.#generation) await this._updateInstant()
  }

  async update(): Promise<void> {
    const [slowChanged, realChanged] = await Promise.all([
      this.#fetchSlowRates(),
      this.#fetchRealTimeRates(),
    ])
    await this.#pruneAndPublish()
    if (this.#started && (slowChanged || realChanged)) await this._update()
  }

  stop(): void {
    this.#started = false
    this.#generation++
    // Retain only expired markers until restart can distinguish promotions from temporary rates.
    for (const ticker of this.#temporaryTickers.keys()) this.#temporaryTickers.set(ticker, 0)
    this.#logMissing.reset()
    this.#slowFetchesInFlight.clear()
    this.#realTimeFetchesInFlight.clear()
    this.#prevAssetNames = []
    this.#subscriptions.forEach((unsubscribe) => unsubscribe())
    this.#subscriptions = []

    if (this.#expiryTimeoutId) {
      clearTimeout(this.#expiryTimeoutId)
      this.#expiryTimeoutId = null
    }

    if (this.#slowIntervalId) {
      clearInterval(this.#slowIntervalId)
      this.#slowIntervalId = null
    }

    if (this.#realTimeIntervalId) {
      clearInterval(this.#realTimeIntervalId)
      this.#realTimeIntervalId = null
    }
  }

  _updateInstant = async (): Promise<void> => {
    const generation = this.#generation
    const tickers = await this.#getMonitoredTickers()
    const fiatCurrency = await this.#getCurrency()
    if (!this.#started || generation !== this.#generation) return
    const mergedRates: RateByAssetTicker = Object.fromEntries(
      tickers.map((ticker): [string, Rate] => {
        const baseRate: Rate = this.#slowRatesByFiat[fiatCurrency]?.[ticker] ?? { ...INVALID_RATE }
        const realTimeData = this.#getRealTimeData({ fiatCurrency, ticker })
        const finalRate: Rate = realTimeData
          ? { ...baseRate, ...realTimeData, invalid: false, isRealTime: true }
          : baseRate

        return [ticker, finalRate]
      })
    )

    const missing = tickers.filter((ticker) => mergedRates[ticker]?.invalid)

    this.#logMissing(missing)
    this.#rates = { ...this.#rates, [fiatCurrency]: mergedRates }
    this.#needsPublish = false
    await this.#ratesAtom.set(this.#rates)
  }

  #pruneAndPublish = async (): Promise<void> => {
    await this.#getMonitoredTickers()
    if (!this.#started || !this.#needsPublish) return
    this.#needsPublish = false
    await this.#ratesAtom.set(this.#rates)
  }

  #getRealTimeData = ({
    fiatCurrency,
    ticker,
  }: {
    fiatCurrency: string
    ticker: string
  }): { price: number; priceUSD?: number } | null => {
    const realTimeEntry = this.#realTimeRatesByFiat[fiatCurrency]
    if (!realTimeEntry?.data[ticker]) return null
    const price = normalizeValue(realTimeEntry.data[ticker])
    if (price === null || !Number.isFinite(price) || price === 0) {
      return null
    }

    const result: { price: number; priceUSD?: number } = { price }

    if (fiatCurrency === 'USD') {
      result.priceUSD = price
    }

    return result
  }

  #logMissing = memoize(
    (tickers: string[]) => {
      if (tickers.length > 0) {
        this.#logger.warn(`Pricing data missing for: ${tickers.join(', ')}`)
      }
    },
    (tickers: string[]) => tickers.join(',')
  )

  async start(): Promise<void> {
    if (this.#started) return
    this.#started = true
    const generation = this.#generation
    this.#subscriptions.push(
      this.#currencyAtom.observe(() => {
        if (Object.keys(this.#rates).length === 0) return
        if (this.#started) void this.update().then(() => this._update())
      }),
      this.#ratesAssetNamesToMonitorAtom.observe((assetNames) => {
        if (!this.#started) return
        void this.#handleAssetNamesChange(assetNames)
      }),
      this.#ratesAtom.observe((rates) => {
        this.#rates = rates
      })
    )
    try {
      await this.update()
      const fiatCurrency = await this.#getCurrency()
      const publishedRates = await this.#ratesAtom.get()
      if (
        this.#started &&
        !publishedRates[fiatCurrency] &&
        (this.#slowRatesByFiat[fiatCurrency] || this.#realTimeRatesByFiat[fiatCurrency])
      ) {
        await this._updateInstant()
      }
    } catch (error) {
      this.#logger.error(error)
    }

    if (!this.#started || generation !== this.#generation) return

    this.#slowIntervalId = setInterval(async () => {
      if (!this.#started) return
      try {
        const changed = await this.#fetchSlowRates()
        await this.#pruneAndPublish()
        if (changed) await this._update()
      } catch (error) {
        this.#logger.error(error)
      }
    }, this.#fetchInterval)

    this.#realTimeIntervalId = setInterval(async () => {
      if (!this.#started) return
      try {
        const changed = await this.#fetchRealTimeRates()
        await this.#pruneAndPublish()
        if (changed) await this._update()
      } catch (error) {
        this.#logger.error(error)
      }
    }, this.#fetchRealTimePricesInterval)
  }

  #handleAssetNamesChange = async (currentAssetNames: string[]): Promise<void> => {
    try {
      if (this.#prevAssetNames.length > 0) {
        const newAssetNames = difference(currentAssetNames, this.#prevAssetNames)
        const { value: assets } = await this.#assetsAtom.get()
        const fiatCurrency = await this.#getCurrency()
        const addedTickers = newAssetNames
          .map((assetName) => getTicker(assets[assetName]))
          .filter((ticker): ticker is string => !!ticker)
          .filter(
            (ticker) =>
              !this.#temporaryTickers.has(ticker) ||
              this.#slowRatesByFiat[fiatCurrency]?.[ticker]?.invalid !== false
          )
          .sort((a, b) => a.localeCompare(b))

        if (addedTickers.length === 0) {
          this.#prevAssetNames = currentAssetNames
          return
        }

        void this._fetchSlowRatesConcurrent({ tickers: addedTickers }).then(() => this._update())
      }

      this.#prevAssetNames = currentAssetNames
    } catch (error) {
      this.#errorTracking.track({
        error,
      })
    }
  }
}

const createRatesMonitor = (deps: RatesMonitorDependencies) => new RatesMonitor(deps)

const ratesMonitorDefinition = {
  id: 'ratesMonitor',
  type: 'module',
  factory: createRatesMonitor,
  dependencies: [
    'currencyAtom',
    'pricingClient',
    'assetsAtom',
    'ratesAssetNamesToMonitorAtom',
    'logger',
    'ratesAtom',
    'config',
    'errorTracking',
  ],
  public: true,
} as const satisfies Definition

export type { RatesMonitor }
export default ratesMonitorDefinition
