import type { Atom, Logger, Port, ReadonlyAtom } from '@exodus/atoms'

export type Granularity = 'day' | 'hour' | 'minute'
export type PriceTimeType = 'daily' | 'hourly' | 'minutely'
export type PriceData = { close: number }
export type CacheEntry = [number, PriceData]
export type PriceRecord = Map<number, number>
export type AssetPrices = Record<string, PriceRecord>
export type GranularityPrices = {
  daily?: AssetPrices
  hourly?: AssetPrices
  minutely?: AssetPrices
}
export type MarketHistoryData = Record<string, GranularityPrices>
export type MarketHistoryState = { data: MarketHistoryData }
export type FiatCurrency = { defaultUnit: { unitName: string } }
export type Asset = { ticker: string; name: string; isCombined?: boolean }
export type GetPriceFn = (assetName: string, time: Date) => number | null

export type ErrorTracking = {
  track: (params: { error: unknown; context: string | Record<string, string> }) => void
}

export type MarketHistoryPort = Port<MarketHistoryState>

export type HistoricalPriceParams = {
  assets: string[]
  fiatArray: string[]
  granularity: Granularity
  limit: number
  timestamp?: number
  ignoreInvalidSymbols?: boolean
}

export type HistoricalPriceResponse = Record<
  string,
  Record<string, { time: number; close: number; open: number }[]>
> & {
  requestErrors?: Record<string, string[]>
}

export type PricingClient = {
  historicalPrice: (params: HistoricalPriceParams) => Promise<HistoricalPriceResponse>
}

export type MarketHistoryStorage = {
  get: (key: string) => Promise<unknown>
  set: (key: string, value: unknown) => Promise<void>
  clear: () => Promise<void>
  batchGet: (keys: string[]) => Promise<unknown[]>
  batchSet: (changes: Record<string, CacheEntry[]>) => Promise<void>
}

export type AssetsAtom = {
  get: () => Promise<{ value: Record<string, Asset> }>
}

export type MarketHistoryMonitorDependencies = {
  assetsAtom: AssetsAtom
  storage: MarketHistoryStorage
  currencyAtom: Atom<string>
  pricingClient: PricingClient
  getCacheKey?: (params: {
    currency: string
    assetName: string
    granularity: Granularity
  }) => string
  remoteConfigRefreshIntervalAtom?: ReadonlyAtom<number | null> | null
  clearCacheAtom?: Atom<string | null>
  remoteConfigClearCacheAtom?: Atom<string | null>
  enabledAssetsAtom: ReadonlyAtom<Record<string, Asset>>
  marketHistoryAtom: Atom<MarketHistoryState | undefined>
  logger: Logger
  config?: { granularityRequestLimits?: Record<Granularity, number> }
  synchronizedTime: { now: () => number }
  errorTracking: ErrorTracking
}

export type MarketHistoryMonitor = {
  start: () => Promise<void>
  stop: () => void
  hydrate: () => Promise<void>
  update: (granularity: Granularity) => Promise<void>
  updateAll: () => Promise<void>
  fetchAssets: (assetNames: string[], granularities?: Granularity[]) => Promise<void>
  fetchAssetPricesFromDate: (params: {
    assetName: string
    granularity: Granularity
    startTimestamp: number
  }) => Promise<void>
}

export type FetchApiFunction = (params: HistoricalPriceParams) => Promise<HistoricalPriceResponse>

export type DataSelector = (state: unknown) => MarketHistoryData
export type BooleanSelector = (state: unknown) => boolean
export type TimeSelector = (state: unknown) => number
export type GetAssetPricesSelector = (
  state: unknown
) => (assetName: string) => PriceRecord | undefined
export type CreateAssetRateSelector = (
  assetName: string
) => (state: unknown) => { price?: number } | undefined
