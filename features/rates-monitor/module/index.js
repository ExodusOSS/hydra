import { difference, memoize, pDebounce } from '@exodus/basic-utils'
import makeConcurrent from 'make-concurrent'

const normalizeValue = (value, opts = Object.create(null)) => {
  if (!opts.canBeNegative && value < 0) return null
  if (value === 0 && !opts.zeroIsNotNull) return null
  if (!Number.isFinite(value)) return null
  return value
}

export function initializeSimulationDataForTickers({
  tickers,
  realTimeData,
  now,
  simulationInterval,
  slowRates,
  staggerUpdateEnabled = true,
}) {
  const simData = {
    data: { ...realTimeData },
    change24Data: {},
    lastSimulationTime: now,
    lastAssetUpdateTime: {},
    updateOffsets: {},
    staggerUpdateEnabled,
  }

  for (let i = 0; i < tickers.length; i++) {
    const ticker = tickers[i]
    const offset = Math.floor((i / tickers.length) * simulationInterval)
    simData.updateOffsets[ticker] = offset
    simData.lastAssetUpdateTime[ticker] = now - offset

    const initialChange24 = slowRates[ticker]?.change24 || 0
    simData.change24Data[ticker] = initialChange24
  }

  return simData
}

/**
 * Implements a mean reversion model based on a discrete-time approximation of the Ornstein-Uhlenbeck process.
 * https://en.wikipedia.org/wiki/Ornstein%E2%80%93Uhlenbeck_process
 */
export function generateMockPrice({ lastPrice, meanPrice, lastChange24 }) {
  const d = 0.0005
  const revertStrength = 0.03

  const noise = d * (Math.random() * 2 - 1)
  const correction = (revertStrength * (meanPrice - lastPrice)) / meanPrice

  const priceChangeRatio = noise + correction
  let newPrice = lastPrice * (1 + priceChangeRatio)

  // If the price is 0 or negative, set it to a very small value
  // This prevents getIsRateAvailable selector from returning false during simulation
  if (newPrice <= 0) {
    newPrice = 0.001
  }

  const newChange24 = lastChange24 + priceChangeRatio * 100

  return {
    price: newPrice,
    change24: newChange24,
  }
}

export function generatePriceSimulation({
  simulationEnabled,
  fiatCurrency,
  realTimeRatesByFiat,
  topAssetTickers,
  simulatedRatesByFiat,
  slowRates,
  simulationInterval,
  logger,
}) {
  if (!simulationEnabled) {
    return { hasChanged: false }
  }

  const realTimeEntry = realTimeRatesByFiat[fiatCurrency]

  if (!realTimeEntry || !realTimeEntry.data) {
    return { hasChanged: false }
  }

  const lastRealDataTime = realTimeEntry.timestamp || 0
  const now = Date.now()
  const timeSinceLastUpdate = now - lastRealDataTime

  if (lastRealDataTime > 0 && timeSinceLastUpdate > 60_000) {
    logger?.warn('Real-time data is outdated, stopping simulation')
    return { hasChanged: false }
  }

  let currentSimData = simulatedRatesByFiat[fiatCurrency]

  // Initialize simulation data if it doesn't exist
  if (!currentSimData) {
    currentSimData = initializeSimulationDataForTickers({
      tickers: Object.keys(realTimeEntry.data).filter((t) => realTimeEntry.data[t]),
      realTimeData: { ...realTimeEntry.data },
      now,
      simulationInterval,
      slowRates,
      staggerUpdateEnabled: true,
    })

    return {
      hasChanged: true,
      simulatedData: currentSimData,
      newRealTimeData: {
        data: { ...currentSimData.data },
        timestamp: now,
      },
    }
  }

  const lastSimTime = currentSimData.lastSimulationTime || now

  // Reset simulation with new API data
  if (lastRealDataTime > lastSimTime) {
    const newSimData = initializeSimulationDataForTickers({
      tickers: Object.keys(realTimeEntry.data).filter((t) => realTimeEntry.data[t]),
      realTimeData: { ...realTimeEntry.data },
      now,
      simulationInterval,
      slowRates,
      staggerUpdateEnabled: true,
    })

    logger?.info('Simulation data reset with new API data')

    return {
      hasChanged: true,
      simulatedData: newSimData,
      newRealTimeData: {
        data: { ...newSimData.data },
        timestamp: now,
      },
    }
  }

  const newSimulatedData = { ...currentSimData.data }
  const change24Data = { ...currentSimData.change24Data }
  const lastAssetUpdateTime = { ...currentSimData.lastAssetUpdateTime }
  const updateOffsets = { ...currentSimData.updateOffsets }
  const staggerUpdateEnabled = currentSimData.staggerUpdateEnabled !== false

  let hasChanged = false
  let updatedAssetCount = 0

  for (const ticker of topAssetTickers) {
    const basePrice = realTimeEntry.data[ticker]
    if (!basePrice || !ticker) continue

    const lastUpdateTime = lastAssetUpdateTime[ticker] || 0
    const timeSinceLastAssetUpdate = now - lastUpdateTime

    if (staggerUpdateEnabled && timeSinceLastAssetUpdate < simulationInterval) {
      continue
    }

    const currentPrice = currentSimData.data[ticker] || basePrice
    const currentChange24 = change24Data[ticker] || slowRates[ticker]?.change24 || 0

    const { price: newPrice, change24: newChange24 } = generateMockPrice({
      lastPrice: currentPrice,
      meanPrice: basePrice,
      lastChange24: currentChange24,
    })

    newSimulatedData[ticker] = newPrice
    change24Data[ticker] = newChange24
    lastAssetUpdateTime[ticker] = now
    hasChanged = true
    updatedAssetCount++
  }

  if (hasChanged) {
    const newSimData = {
      data: newSimulatedData,
      change24Data,
      lastSimulationTime: now,
      lastAssetUpdateTime,
      updateOffsets,
      staggerUpdateEnabled,
    }

    const statusMessage = staggerUpdateEnabled
      ? `Price simulation completed for ${updatedAssetCount} of ${topAssetTickers.length} real-time assets`
      : `Price simulation completed for ${topAssetTickers.length} real-time assets`

    logger?.info(statusMessage)

    return {
      hasChanged: true,
      simulatedData: newSimData,
      newRealTimeData: {
        data: newSimulatedData,
        timestamp: now,
      },
    }
  }

  return { hasChanged: false }
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
  #simulationInterval
  #slowRates = Object.create(null)
  #rates = Object.create(null)
  #realTimeRatesByFiat = Object.create(null)
  #simulatedRatesByFiat = Object.create(null)
  #baseRealTimeRatesByFiat = Object.create(null)
  #lastSimulationTime = Object.create(null)
  #ratesAtom
  #subscriptions = []
  #started = false
  #slowFetchInFlight = false
  #realTimeFetchInFlight = false
  #slowIntervalId = null
  #realTimeIntervalId = null
  #simulationIntervalId = null
  #lastCurrentPriceCtx = { tickers: [], fiatCurrency: '', lastModified: undefined }
  #lastRealTimeCtxByFiat = Object.create(null)
  #topAssetTickers = []
  #logger
  #ratesSimulationEnabledAtom

  constructor({
    currencyAtom,
    pricingClient,
    assetsModule,
    availableAssetNamesAtom,
    logger,
    ratesAtom,
    config,
    ratesSimulationEnabledAtom,
  }) {
    this.#currencyAtom = currencyAtom
    this.#pricingClient = pricingClient
    this.#availableAssetNamesAtom = availableAssetNamesAtom
    this.#logger = logger
    this.#ratesAtom = ratesAtom
    this.#fetchInterval = config.fetchInterval
    this.#debounceInterval = config.debounceInterval
    this.#fetchRealTimePricesInterval = config.fetchRealTimePricesInterval
    this.#simulationInterval = config.simulationInterval
    this.#ratesSimulationEnabledAtom = ratesSimulationEnabledAtom
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
        const realTimeData = realTimeRes.data.reduce((acc, next) => {
          const ticker = Object.keys(next)[0]
          acc[ticker] = next[ticker][fiatCurrency]
          return acc
        }, Object.create(null))

        this.#realTimeRatesByFiat[fiatCurrency] = {
          data: { ...realTimeData },
          timestamp: Date.now(),
        }

        this.#baseRealTimeRatesByFiat[fiatCurrency] = {
          data: { ...realTimeData },
          timestamp: Date.now(),
          isRealData: true,
        }

        this.#updateTopAssets(realTimeData)
        this.#lastSimulationTime[fiatCurrency] = Date.now()

        const now = Date.now()
        const tickers = Object.keys(realTimeData).filter((ticker) => !!realTimeData[ticker])
        this.#simulatedRatesByFiat[fiatCurrency] = initializeSimulationDataForTickers({
          tickers,
          realTimeData,
          now,
          simulationInterval: this.#simulationInterval,
          slowRates: this.#slowRates,
          staggerUpdateEnabled: true,
        })

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

  #updateTopAssets(realTimeData) {
    this.#topAssetTickers = Object.keys(realTimeData).filter((ticker) => !!realTimeData[ticker])

    this.#logger.info(`Real-time data assets updated: ${this.#topAssetTickers.length} assets`)
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

    if (this.#simulationIntervalId) {
      clearInterval(this.#simulationIntervalId)
      this.#simulationIntervalId = null
    }
  }

  _updateInstant = async () => {
    const tickers = await this.#getAvailableAssetTickers()
    const fiatCurrency = await this.#getCurrency()
    const simulationEnabled = await this.#ratesSimulationEnabledAtom.get()
    const mergedRates = Object.fromEntries(
      tickers.map((ticker) => {
        const finalObj = Object.assign(Object.create(null), this.#slowRates[ticker])

        const realTimeData = this.#getRealTimeData({ fiatCurrency, ticker })

        if (realTimeData) {
          Object.assign(finalObj, realTimeData, { invalid: false, isRealTime: true })

          if (
            simulationEnabled &&
            this.#simulatedRatesByFiat[fiatCurrency] &&
            typeof this.#simulatedRatesByFiat[fiatCurrency].change24Data?.[ticker] === 'number'
          ) {
            finalObj.change24 = this.#simulatedRatesByFiat[fiatCurrency].change24Data[ticker]
          }
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
    // Store the current simulation state at the initialization point in start()
    let prevSimulationEnabled = await this.#ratesSimulationEnabledAtom.get()

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
      }),

      this.#ratesSimulationEnabledAtom.observe((enabled) => {
        // If the simulation state is the same as the previous state, skip the initial call of _update()
        if (enabled === prevSimulationEnabled) {
          this.#logger.info('Simulation state is the same, skipping update')
          return
        }

        prevSimulationEnabled = enabled

        this.#logger.info(`Simulation ${enabled ? 'enabled' : 'disabled'}`)

        if (this.#simulationIntervalId) {
          clearInterval(this.#simulationIntervalId)
          this.#simulationIntervalId = null
        }

        if (enabled && this.#started) {
          this.#startSimulation()
        } else if (!enabled) {
          // If the simulation is disabled, reset to real-time data
          for (const fiatCurrency in this.#realTimeRatesByFiat) {
            if (this.#baseRealTimeRatesByFiat[fiatCurrency]?.isRealData) {
              this.#realTimeRatesByFiat[fiatCurrency] = {
                ...this.#baseRealTimeRatesByFiat[fiatCurrency],
                timestamp: Date.now(),
              }
            }
          }

          this.#simulatedRatesByFiat = Object.create(null)
          this.#logger.info('Simulation disabled, resetting to real-time data')
          this._update()
        }
      })
    )
    try {
      const [slowChanged, realChanged] = await Promise.all([
        this.#fetchSlowRates(),
        this.#fetchRealTimeRates(),
      ])
      if (!this.#started) return
      if (slowChanged || realChanged) {
        await this._update()
      }
    } catch (err) {
      this.#logger.error(err)
    }

    if (!this.#started) return

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

    if (await this.#ratesSimulationEnabledAtom.get()) {
      this.#startSimulation()
    }
  }

  #startSimulation() {
    if (this.#simulationIntervalId) {
      clearInterval(this.#simulationIntervalId)
    }

    const checkInterval = Math.min(this.#simulationInterval, 1000)

    this.#simulationIntervalId = setInterval(async () => {
      if (!this.#started) return
      try {
        await this.#runPriceSimulation()
      } catch (err) {
        this.#logger.error(err)
      }
    }, checkInterval)
  }

  #runPriceSimulation = async () => {
    const simulationEnabled = await this.#ratesSimulationEnabledAtom.get()
    if (!simulationEnabled) {
      return
    }

    const fiatCurrency = await this.#getCurrency()
    const result = generatePriceSimulation({
      simulationEnabled,
      fiatCurrency,
      realTimeRatesByFiat: this.#realTimeRatesByFiat,
      topAssetTickers: this.#topAssetTickers,
      simulatedRatesByFiat: this.#simulatedRatesByFiat,
      slowRates: this.#slowRates,
      simulationInterval: this.#simulationInterval,
      logger: this.#logger,
    })

    if (result.hasChanged) {
      if (result.simulatedData) {
        this.#simulatedRatesByFiat[fiatCurrency] = {
          ...result.simulatedData,
          staggerUpdateEnabled: true,
        }
      }

      if (result.newRealTimeData) {
        this.#realTimeRatesByFiat[fiatCurrency] = result.newRealTimeData
      }

      await this._update()
      return true
    }

    return false
  }

  enableSimulation() {
    return this.#ratesSimulationEnabledAtom.set(true)
  }

  disableSimulation() {
    return this.#ratesSimulationEnabledAtom.set(false)
  }

  async isSimulationEnabled() {
    return this.#ratesSimulationEnabledAtom.get()
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
    'ratesSimulationEnabledAtom',
  ],
  public: true,
}

export default ratesMonitorDefinition
