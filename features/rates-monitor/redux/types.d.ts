export type Rate = {
  cap: number
  change24: number
  invalid: boolean
  price: number
  priceUSD: number
  volume24: number
}

export type RateByAssetTicker = {
  [assetTicker: string]: Rate
}

export type RatesByCurrency = {
  [currency: string]: RateByAssetTicker
}
