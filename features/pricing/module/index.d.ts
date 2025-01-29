type WithModifyParams<T extends object> = T & {
  lastModified?: string
  entityTag?: string
}

type WithModifyResult<T> =
  | {
      isModified: true
      lastModified?: string
      entityTag?: string
      data: T
    }
  | {
      isModified: false
    }

type CurrentPriceParams = {
  assets: string[]
  fiatCurrency?: string
  ignoreInvalidSymbols?: boolean
}

type Pricing = {
  [currency: string]: string | number
} & { USD: string | number } // USD pricing is always guaranteed to exist

type CurrentPriceResult = { [assetTicker: string]: Pricing }

declare class ExodusPricingClient {
  constructor()

  currentPrice(params: CurrentPriceParams): Promise<CurrentPriceResult>
  currentPrice(
    params: WithModifyParams<CurrentPriceParams>
  ): Promise<WithModifyResult<CurrentPriceResult>>
}

declare const createExodusPricingClient: (opts: any) => ExodusPricingClient

declare const pricingClientDefinition = {
  factory: createExodusPricingClient,
}

export type CurrentPriceFn = ExodusPricingClient['currentPrice']

export default pricingClientDefinition
