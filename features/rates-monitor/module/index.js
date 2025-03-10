import { memoize, pDebounce, difference } from '@exodus/basic-utils'
import makeConcurrent from 'make-concurrent'

const normalizeValue = (value, opts = Object.create(null)) => {
  if (!opts.canBeNegative && value < 0) return null
  if (value === 0 && !opts.zeroIsNotNull) return null
  if (!Number.isFinite(value)) return null
  return value
}

function buildSlowRates({ tickers, fiatCurrency, currentPriceResponse, tickerResponse }) {
  const slowRates = Object.create(null)
  for (const ticker of tickers) {
    const price = normalizeValue(currentPriceResponse?.[ticker]?.[fiatCurrency])
    const priceUSD = normalizeValue(currentPriceResponse?.[ticker]?.USD)
    const change24 =
      normalizeValue(tickerResponse?.[ticker]?.[fiatCurrency]?.c24h, { canBeNegative: true }) || 0
    const volume24 = normalizeValue(tickerResponse?.[ticker]?.[fiatCurrency]?.v24h) || 0
    const cap = normalizeValue(tickerResponse?.[ticker]?.[fiatCurrency]?.mc) || 0
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

function arrayElementsShallowEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false
  return arr1.every((value, index) => value === arr2[index])
}

class RatesMonitor {
  #pricingClient
  #currencyAtom
  #getTicker
  #availableAssetNamesAtom
  #fetchInterval
  #debounceInterval
  #fetchRealTimePricesInterval
  #slowRates = Object.create(null)
  #rates = Object.create(null)
  #realTimeRatesByFiat = Object.create(null)
  #ratesAtom
  #subscriptions = []
  #started = false
  #slowFetchInFlight = false
  #realTimeFetchInFlight = false
  #slowIntervalId = null
  #realTimeIntervalId = null
  #lastCurrentPriceCtx = { tickers: [], fiatCurrency: '', lastModified: undefined }
  #lastRealTimeCtxByFiat = Object.create(null)
  #logger

  constructor({
    currencyAtom,
    pricingClient,
    assetsModule,
    availableAssetNamesAtom,
    logger,
    ratesAtom,
    config,
  }) {
    this.#currencyAtom = currencyAtom
    this.#pricingClient = pricingClient
    this.#availableAssetNamesAtom = availableAssetNamesAtom
    this.#logger = logger
    this.#ratesAtom = ratesAtom
    this.#fetchInterval = config.fetchInterval
    this.#debounceInterval = config.debounceInterval
    this.#fetchRealTimePricesInterval = config.fetchRealTimePricesInterval
    this.#getTicker = (assetName) => assetsModule.getAsset(assetName)?.ticker
    this._update = pDebounce(this._updateInstant, this.#debounceInterval)
    this._fetchSlowRatesConcurrent = makeConcurrent((...args) => this.#fetchSlowRates(...args), {
      concurrency: 1,
    })
  }

  #getAvailableAssetTickers = async () => {
    const assetNames = await this.#availableAssetNamesAtom.get()
    return assetNames.map(this.#getTicker).sort()
  }

  #getCurrency = async () => this.#currencyAtom.get()

  async #fetchSlowRates({ tickers: tickers_ } = {}) {
    if (!tickers_) {
      if (this.#slowFetchInFlight) return false
      this.#slowFetchInFlight = true
    }

    let changed = false
    try {
      const tickers = tickers_ || (await this.#getAvailableAssetTickers())
      const fiatCurrency = await this.#getCurrency()
      const sameAsPrevious =
        arrayElementsShallowEqual(this.#lastCurrentPriceCtx.tickers, tickers) &&
        this.#lastCurrentPriceCtx.fiatCurrency === fiatCurrency
      const lastModified = sameAsPrevious ? this.#lastCurrentPriceCtx.lastModified : undefined
      const [currentPriceRes, tickerResponse] = await Promise.all([
        this.#pricingClient.currentPrice({ assets: tickers, fiatCurrency, lastModified }),
        this.#pricingClient.ticker({ assets: tickers, fiatCurrency }),
      ])
      if (currentPriceRes.isModified) {
        this.#lastCurrentPriceCtx = {
          tickers,
          fiatCurrency,
          lastModified: currentPriceRes.lastModified,
        }
        this.#slowRates = {
          ...this.#slowRates,
          ...buildSlowRates({
            tickers,
            fiatCurrency,
            currentPriceResponse: currentPriceRes.data,
            tickerResponse,
          }),
        }
        changed = true
      } else {
        this.#logger.info('price data is not modified, skipping slow-rates update tick')
      }
    } catch (err) {
      this.#logger.warn(`Failed to fetch slow rates: ${err.message}`)
    } finally {
      this.#slowFetchInFlight = false
    }

    return changed
  }

  async #fetchRealTimeRates() {
    if (this.#realTimeFetchInFlight) return false
    this.#realTimeFetchInFlight = true
    let changed = false
    try {
      const fiatCurrency = await this.#getCurrency()
      const oldCtx = this.#lastRealTimeCtxByFiat[fiatCurrency] || {
        lastModified: undefined,
        entityTag: undefined,
      }
      const realTimeRes = await this.#pricingClient.realTimePrice({
        fiatCurrency,
        ignoreInvalidSymbols: true,
        lastModified: oldCtx.lastModified,
        entityTag: oldCtx.entityTag,
      })
      if (realTimeRes.isModified) {
        this.#realTimeRatesByFiat[fiatCurrency] = {
          data: realTimeRes.data.reduce((acc, next) => {
            const ticker = Object.keys(next)[0]
            acc[ticker] = next[ticker][fiatCurrency]
            return acc
          }, Object.create(null)),
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
      this.#logger.warn(`Failed to fetch real-time pricing: ${error.message}`)
    } finally {
      this.#realTimeFetchInFlight = false
    }

    return changed
  }

  async update() {
    const [slowChanged, realChanged] = await Promise.all([
      this.#fetchSlowRates(),
      this.#fetchRealTimeRates(),
    ])
    if (slowChanged || realChanged) {
      await this._update()
    }
  }

  stop() {
    this.#started = false
    this.#subscriptions.forEach((unsubscribe) => unsubscribe())
    this.#subscriptions = []
    if (this.#slowIntervalId) {
      clearInterval(this.#slowIntervalId)
      this.#slowIntervalId = null
    }

    if (this.#realTimeIntervalId) {
      clearInterval(this.#realTimeIntervalId)
      this.#realTimeIntervalId = null
    }
  }

  _updateInstant = async () => {
    const tickers = await this.#getAvailableAssetTickers()
    const fiatCurrency = await this.#getCurrency()
    const mergedRates = Object.fromEntries(
      tickers.map((ticker) => {
        const finalObj = Object.assign(Object.create(null), this.#slowRates[ticker])
        const realTimeData = this.#getRealTimeData({ fiatCurrency, ticker })

        if (realTimeData) {
          Object.assign(finalObj, realTimeData, { invalid: false })
        }

        if (Object.keys(finalObj).length === 0) {
          return [
            ticker,
            { invalid: true, price: 0, priceUSD: 0, change24: 0, volume24: 0, cap: 0 },
          ]
        }

        return [ticker, finalObj]
      })
    )

    const missing = tickers.filter((ticker) => mergedRates[ticker].invalid)

    this.#logMissing(missing)
    const nextRates = { ...this.#rates, [fiatCurrency]: mergedRates }
    if (nextRates[fiatCurrency] !== this.#rates[fiatCurrency]) {
      this.#rates = nextRates
      await this.#ratesAtom.set(this.#rates)
    }
  }

  #getRealTimeData = ({ fiatCurrency, ticker }) => {
    const realTimeEntry = this.#realTimeRatesByFiat[fiatCurrency]
    if (!realTimeEntry?.data?.[ticker]) return null
    const price = normalizeValue(realTimeEntry.data?.[ticker])
    if (!Number.isFinite(price) || price === 0) {
      return null
    }

    const result = { price }

    if (fiatCurrency === 'USD') {
      result.priceUSD = price
    }

    return result
  }

  #logMissing = memoize(
    (tickers) => {
      if (tickers.length > 0) {
        this.#logger.warn(`Pricing data missing for: ${tickers.join(', ')}`)
      }
    },
    (tickers) => tickers.join(',')
  )

  async start() {
    if (this.#started) return
    this.#started = true
    this.#subscriptions.push(
      this.#currencyAtom.observe(() => {
        if (Object.keys(this.#rates).length === 0) return
        this.#started && this.update()
      }),
      this.#availableAssetNamesAtom.observe((availableAssetNames) => {
        if (!this.#started) return

        if (this.prevAvailableAssetNames) {
          const newAssetNames = difference(availableAssetNames, this.prevAvailableAssetNames)
          const addedTickers = newAssetNames.map(this.#getTicker).sort()

          if (addedTickers.length === 0) {
            return
          }

          this._fetchSlowRatesConcurrent({ tickers: addedTickers }).then(() => this._update())
        }

        this.prevAvailableAssetNames = availableAssetNames
      }),
      this.#ratesAtom.observe((rates) => {
        this.#rates = rates
      })
    )
    try {
      const [slowChanged, realChanged] = await Promise.all([
        this.#fetchSlowRates(),
        this.#fetchRealTimeRates(),
      ])
      if (slowChanged || realChanged) {
        await this._update()
      }
    } catch (err) {
      this.#logger.error(err)
    }

    this.#slowIntervalId = setInterval(async () => {
      if (!this.#started) return
      try {
        const changed = await this.#fetchSlowRates()
        if (changed) await this._update()
      } catch (err) {
        this.#logger.error(err)
      }
    }, this.#fetchInterval)
    this.#realTimeIntervalId = setInterval(async () => {
      if (!this.#started) return
      try {
        const changed = await this.#fetchRealTimeRates()
        if (changed) await this._update()
      } catch (err) {
        this.#logger.error(err)
      }
    }, this.#fetchRealTimePricesInterval)
  }
}

const createRatesMonitor = (deps) => new RatesMonitor(deps)

const ratesMonitorDefinition = {
  id: 'ratesMonitor',
  type: 'module',
  factory: createRatesMonitor,
  dependencies: [
    'currencyAtom',
    'pricingClient',
    'assetsModule',
    'availableAssetNamesAtom',
    'logger',
    'ratesAtom',
    'config',
  ],
  public: true,
}

export default ratesMonitorDefinition
