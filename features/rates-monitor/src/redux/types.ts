import type { RootStateWithSlice } from '@exodus/redux-dependency-injection'

export type Rate = {
  cap: number
  change24: number
  invalid: boolean
  price: number
  priceUSD: number
  volume24: number
  isRealTime?: boolean
}

export type RateByAssetTicker = {
  [assetTicker: string]: Rate
}

export type RatesByCurrency = {
  [currency: string]: RateByAssetTicker
}

export type RatesState = {
  loaded: boolean
  data: RatesByCurrency
  error: string | null
}

export type RatesSelectorState = RootStateWithSlice<'rates', RatesState>
