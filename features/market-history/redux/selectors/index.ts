import marketHistoryLoadingSelector, {
  dailyMarketHistoryIsLoadingSelector,
  hourlyMarketHistoryIsLoadingSelector,
  minutelyMarketHistoryIsLoadingSelector,
} from './loading.js'
import fiatMarketHistorySelector from './fiat-market-history.js'
import dailyPricesSelector from './daily-prices.js'
import hourlyPricesSelector from './hourly-prices.js'
import minutelyPricesSelector from './minutely-prices.js'
import getAssetDailyPricesSelector from './get-asset-daily-prices.js'
import getAssetHourlyPricesSelector from './get-asset-hourly-prices.js'
import getAssetMinutelyPricesSelector from './get-asset-minutely-prices.js'
import createGetAssetDailyPriceSelector from './get-asset-daily-price.js'
import createGetAssetHourlyPriceSelector from './get-asset-hourly-price.js'
import createGetAssetMinutelyPriceSelector from './get-asset-minutely-price.js'
import getDailyPriceSelector from './get-daily-price.js'
import getHourlyPriceSelector from './get-hourly-price.js'
import getMinutelyPriceSelector from './get-minutely-price.js'
import getPriceWithFallbackSelector from './get-price-with-fallback.js'
import getFiatValueWithFallbackSelector from './get-fiat-value-with-fallback.js'
import createAssetDailyMarketHistoryIsLoadingSelector from './create-asset-daily-prices-loading.js'
import createAssetHourlyMarketHistoryIsLoadingSelector from './create-asset-hourly-prices-loading.js'
import createAssetMinutelyMarketHistoryIsLoadingSelector from './create-asset-minutely-prices-loading.js'

export default [
  marketHistoryLoadingSelector,
  hourlyMarketHistoryIsLoadingSelector,
  dailyMarketHistoryIsLoadingSelector,
  minutelyMarketHistoryIsLoadingSelector,
  fiatMarketHistorySelector,
  dailyPricesSelector,
  hourlyPricesSelector,
  minutelyPricesSelector,
  getAssetDailyPricesSelector,
  getAssetHourlyPricesSelector,
  getAssetMinutelyPricesSelector,
  createGetAssetDailyPriceSelector,
  createGetAssetHourlyPriceSelector,
  createGetAssetMinutelyPriceSelector,
  getDailyPriceSelector,
  getHourlyPriceSelector,
  getMinutelyPriceSelector,
  getPriceWithFallbackSelector,
  getFiatValueWithFallbackSelector,
  createAssetDailyMarketHistoryIsLoadingSelector,
  createAssetHourlyMarketHistoryIsLoadingSelector,
  createAssetMinutelyMarketHistoryIsLoadingSelector,
]
