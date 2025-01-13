import ExodusModule from '@exodus/module' // eslint-disable-line import/no-deprecated
import delay from 'delay'
import { get, isEqual, memoize } from 'lodash' // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file
import { pDebounce } from '@exodus/basic-utils'

export const MODULE_ID = 'ratesMonitor'

const getValue = (obj, path, opts = {}) => {
  const value = get(obj, path)
  if (!opts.canBeNegative && value < 0) return null
  if (value === 0 && !opts.zeroIsNotNull) return null
  if (!Number.isFinite(value)) return null
  return value
}

class RatesMonitor extends ExodusModule {
  #pricingClient
  #currencyAtom
  #getTicker
  #availableAssetNamesAtom
  #fetchInterval
  #debounceInterval
  #rates = Object.create(null)
  #ratesAtom
  #lastFetchId = -1
  #started = false
  #subscriptions = []

  constructor({
    currencyAtom,
    pricingClient,
    assetsModule,
    availableAssetNamesAtom,
    logger,
    ratesAtom,
    config,
  }) {
    super({ name: MODULE_ID, logger })

    this.#fetchInterval = config.fetchInterval
    this.#debounceInterval = config.debounceInterval
    this.#pricingClient = pricingClient
    this.#getTicker = (assetName) => assetsModule.getAsset(assetName)?.ticker

    this._update = pDebounce(this._updateInstant, this.#debounceInterval)

    this.#currencyAtom = currencyAtom
    this.#availableAssetNamesAtom = availableAssetNamesAtom
    this.#ratesAtom = ratesAtom
  }

  #getAvailableAssetTickers = async () => {
    const assetNames = await this.#availableAssetNamesAtom.get()
    return (
      // TODO: is sort needed?
      assetNames
        //
        .map((assetName) => this.#getTicker(assetName))
        .sort()
    )
  }

  #getCurrency = async () => {
    return this.#currencyAtom.get()
  }

  async _fetch() {
    const tickers = await this.#getAvailableAssetTickers()
    const fiatCurrency = await this.#getCurrency()

    const opts = {
      assets: tickers,
      fiatCurrency,
    }

    return Promise.all([
      //
      this.#pricingClient.currentPrice(opts),
      this.#pricingClient.ticker(opts),
    ])
  }

  _updateInstant = async () => {
    const currentFetchId = ++this.#lastFetchId

    const tickers = await this.#getAvailableAssetTickers()
    const [currentPriceRes, tickerRes] = await this._fetch()
    const currency = await this.#getCurrency()

    const missing = []
    const rates = Object.fromEntries(
      tickers.map((ticker) => {
        const price = getValue(currentPriceRes, `${ticker}.${currency}`)
        const priceUSD = getValue(currentPriceRes, `${ticker}.USD`)

        // If we get bad pricing metadata but valid prices we fallback to zeros for the metadata
        const change24 =
          getValue(tickerRes, `${ticker}.${currency}.c24h`, { canBeNegative: true }) || 0
        const volume24 = getValue(tickerRes, `${ticker}.${currency}.v24h`) || 0
        const cap = getValue(tickerRes, `${ticker}.${currency}.mc`) || 0
        const invalid = price === null || priceUSD === null

        if (invalid) {
          missing.push(ticker)
        }

        return [
          ticker,
          {
            price: price || 0,
            priceUSD: priceUSD || 0,
            change24,
            volume24,
            cap,
            invalid,
          },
        ]
      })
    )

    // ignore rates if a new request has been initiated (we want to wait for that one)

    if (this.#lastFetchId === currentFetchId) {
      this.#logMissing(missing)
      const data = { ...this.#rates, [currency]: rates }
      await this.#ratesAtom.set((current) => (isEqual(current, data) ? current : data))
    }
  }

  #logMissing = memoize(
    (tickers) => {
      if (tickers.length > 0) {
        this._logger.warn(`Pricing data missing for: ${tickers.join(', ')}`)
      }
    },
    (tickers) => tickers.join(',')
  )

  async start() {
    if (this.#started) {
      return
    }

    this.#subscriptions.push(
      this.#currencyAtom.observe((value) => {
        if (Object.keys(this.#rates).length === 0) return
        if (value && this.#started) this._update()
      }),
      this.#availableAssetNamesAtom.observe((value) => {
        if (value && this.#started) this._update()
      }),
      this.#ratesAtom.observe((rates) => (this.#rates = rates))
    )

    this.#started = true

    await this._updateInstant().catch((err) => this._logger.error(err))
    while (this.#started) {
      await delay(this.#fetchInterval)

      try {
        if (this.#started) {
          await this._update()
        }
      } catch (err) {
        this._logger.error(err)
      }
    }
  }

  async update() {
    await this._update()
  }

  stop() {
    this.#started = false
    this.#lastFetchId = -1
    this.#subscriptions.forEach((unsubscribe) => unsubscribe())
    this.#subscriptions = []
  }
}

const createRatesMonitor = (deps) => new RatesMonitor(deps)

const ratesMonitorDefinition = {
  id: MODULE_ID,
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
