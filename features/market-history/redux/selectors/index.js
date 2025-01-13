import marketHistoryLoadingSelector, {
  dailyMarketHistoryIsLoadingSelector,
  hourlyMarketHistoryIsLoadingSelector,
} from './loading'
import fiatMarketHistorySelector from './fiat-market-history'
import dailyPricesSelector from './daily-prices'
import hourlyPricesSelector from './hourly-prices'
import getAssetDailyPricesSelector from './get-asset-daily-prices'
import getAssetHourlyPricesSelector from './get-asset-hourly-prices'
import createGetAssetDailyPriceSelector from './get-asset-daily-price'
import createGetAssetHourlyPriceSelector from './get-asset-hourly-price'
import getDailyPriceSelector from './get-daily-price'
import getHourlyPriceSelector from './get-hourly-price'
import getPriceWithFallbackSelector from './get-price-with-fallback'
import getFiatValueWithFallbackSelector from './get-fiat-value-with-fallback'
import createAssetDailyMarketHistoryIsLoadingSelector from './create-asset-daily-prices-loading'
import createAssetHourlyMarketHistoryIsLoadingSelector from './create-asset-hourly-prices-loading'

export default [
  marketHistoryLoadingSelector,
  hourlyMarketHistoryIsLoadingSelector,
  dailyMarketHistoryIsLoadingSelector,
  fiatMarketHistorySelector,
  dailyPricesSelector,
  hourlyPricesSelector,
  getAssetDailyPricesSelector,
  getAssetHourlyPricesSelector,
  createGetAssetDailyPriceSelector,
  createGetAssetHourlyPriceSelector,
  getDailyPriceSelector,
  getHourlyPriceSelector,
  getPriceWithFallbackSelector,
  getFiatValueWithFallbackSelector,
  createAssetDailyMarketHistoryIsLoadingSelector,
  createAssetHourlyMarketHistoryIsLoadingSelector,
]
