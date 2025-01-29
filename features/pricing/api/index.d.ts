import type { CurrentPriceFn } from '../module/index.js'

declare const pricingApiDefinition: {
  id: 'pricingApi'
  type: 'api'
  factory(): {
    pricing: {
      /**
       * Fetches the current prices for the provided list of assets.
       * @param {object} params - The parameters for fetching current prices.
       * @param {string[]} params.assets - An array of asset tickers to fetch prices for.
       * @param {string} [params.fiatCurrency] - The fiat currency to get the prices in (default is 'USD').
       * @param {boolean} [params.ignoreInvalidSymbols] - If true, ignores invalid asset symbols.
       * @returns {Promise<object>} A promise that resolves to a map of prices by asset ticker and fiat currency.
       * @example
       * ```typescript
       * const data = await exodus.pricing.currentPrice({ assets: ['BTC', 'ETH'], fiatCurrency: 'USD', ignoreInvalidSymbols: true })
       * ```
       */
      /**
       * Fetches the current prices for the provided list of assets (wrapped in modification-related result wrapper)
       * Checks for modification at http-level with provided 'lastModified' / 'entityTag'
       * @param {object} params - The parameters for fetching current prices.
       * @param {string[]} params.assets - An array of asset tickers to fetch prices for.
       * @param {string} [params.fiatCurrency] - The fiat currency to get the prices in (default is 'USD').
       * @param {boolean} [params.ignoreInvalidSymbols] - If true, ignores invalid asset symbols.
       * @param {string} [params.lastModified] - string representing date in rfc7231 format.
       * @param {string} [params.entityTag] - tag of previously observed price entity.
       * @returns {Promise<object>} An object that has either ".isModified: false" or ".isModified: true" with ".data" section that contains map of prices by asset ticker and fiat currency
       * @example
       * ```typescript
       * const data = await exodus.pricing.currentPrice({ assets: ['BTC', 'ETH'], fiatCurrency: 'USD', ignoreInvalidSymbols: true, lastModified: 'Wed, 14 Jun 2017 07:00:00 GMT' })
       * ```
       */
      currentPrice: CurrentPriceFn
      /**
       * Fetches the current ticker information for the provided list of assets.
       * @param {object} params - The parameters for fetching ticker information.
       * @param {string[]} params.assets - An array of asset tickers to fetch ticker data for.
       * @param {string} [params.fiatCurrency] - The fiat currency to get the data in (default is 'USD').
       * @param {boolean} [params.ignoreInvalidSymbols] - If true, ignores invalid asset symbols.
       * @returns {Promise<object>} A promise that resolves to a map of tickers by asset ticker and fiat currency. Each ticker contains:
       *   - `mc`: market cap
       *   - `v24h`: 24-hour volume
       *   - `c24h`: 24-hour price change
       * @example
       * ```typescript
       * const data = await exodus.pricing.ticker({ assets: ['BTC', 'ETH'], fiatCurrency: 'USD', ignoreInvalidSymbols: true })
       * ```
       */
      ticker(params: {
        assets: string[]
        fiatCurrency?: string
        ignoreInvalidSymbols?: boolean
      }): Promise<{
        [assetTicker: string]: {
          [currency: string]: {
            mc: number
            v24h: number
            c24h: number
          }
        }
      }>

      /**
       * Fetches historical price data for the provided list of assets.
       * @param {object} params - The parameters for fetching historical prices.
       * @param {string[]} params.assets - An array of asset tickers to fetch historical prices for.
       * @param {string[]} params.fiatArray - An array of fiat currencies to get the prices in.
       * @param {number} params.limit - The number of data points to retrieve.
       * @param {'hour' | 'day'} params.granularity - The granularity of the data ('hour' or 'day').
       * @param {boolean} [params.ignoreInvalidSymbols] - If true, ignores invalid asset symbols.
       * @param {number} [params.timestamp] - The timestamp to fetch historical data from. for example: Date.now() / 1000.
       * @returns {Promise<object>} A promise that resolves to a map of historical prices by asset ticker and fiat currency. Each entry contains:
       *   - `time`: the timestamp of the data point
       *   - `close`: the closing price at that time
       *   - `open`: the opening price at that time
       * @example
       * ```typescript
       * const data = await exodus.pricing.historicalPrice({
       *   assets: ['BTC'], // ATM we can use only single asset
       *   fiatArray: ['USD', 'EUR'],
       *   limit: 100,
       *   granularity: 'day',
       *   ignoreInvalidSymbols: true,
       *   timestamp: 1731542959
       * })
       * ```
       */
      historicalPrice(params: {
        assets: string[]
        fiatArray: string[]
        limit: number
        granularity: 'hour' | 'day'
        ignoreInvalidSymbols?: boolean
        timestamp?: string
      }): Promise<{
        [assetTicker: string]: {
          [currency: string]: {
            time: number
            close: number
            open: number
          }
        }
        requestErrors?: {
          invalidCryptoSymbols?: string[]
          invalidFiatSymbols?: string[]
          invalidParameters?: string[]
        }
      }>

      /**
       * Fetches real-time prices from CoinGecko API
       * @param {object} params - The parameters for fetching real-time prices
       * @param {string} [params.asset] - Optional asset ticker (e.g. 'BTC'). If not provided, returns top assets
       * @param {string} [params.fiatCurrency] - The fiat currency (default is 'USD')
       * @param {boolean} [params.ignoreInvalidSymbols] - If true, ignores invalid asset symbols
       */
      realTimePrice(params: {
        asset?: string
        fiatCurrency?: string
        ignoreInvalidSymbols?: boolean
      }): Promise<{
        [assetTicker: string]: {
          [currency: string]: number
        }
      }>
    }
  }
}

export default pricingApiDefinition
