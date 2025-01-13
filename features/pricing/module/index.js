import { SynchronizedTime } from '@exodus/basic-utils'
import dayjs from '@exodus/dayjs'
import lodash from 'lodash'

const { merge } = lodash

const IGNORE_INVALID_SYMBOLS = true

class ExodusPricingClient {
  #defaultFetchOptions
  #pricingServerUrlAtom
  #fetch

  constructor({ pricingServerUrlAtom, fetch, headers = {} }) {
    this.#pricingServerUrlAtom = pricingServerUrlAtom

    this.#defaultFetchOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=60', ...headers },
    }

    // to prevent re-binding of fetch's context to ExodusPricingClient
    this.#fetch = (...args) => fetch(...args)
  }

  #fetchPath = async (path, options = this.#defaultFetchOptions) => {
    const baseUrl = await this.#pricingServerUrlAtom.get()
    const url = `${baseUrl}/${path}`
    const response = await this.#fetch(url, options)
    if (!response.ok) {
      // Throw an error here because the calling function is expecting it.
      throw new Error(`${url} ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  currentPrice = async ({
    assets,
    fiatCurrency = 'USD',
    ignoreInvalidSymbols = IGNORE_INVALID_SYMBOLS,
  }) => {
    const parameters = new URLSearchParams({
      from: assets,
      // USD is required in other parts of the application and must be included in all queries
      to: fiatCurrency === 'USD' ? fiatCurrency : [fiatCurrency, 'USD'],
    })
    if (ignoreInvalidSymbols) {
      parameters.set('ignoreInvalidSymbols', ignoreInvalidSymbols)
    }

    return this.#fetchPath(`current-price?${parameters}`)
  }

  ticker = async ({
    assets,
    fiatCurrency = 'USD',
    ignoreInvalidSymbols = IGNORE_INVALID_SYMBOLS,
  }) => {
    const parameters = new URLSearchParams({
      from: assets,
      to: fiatCurrency,
    })
    if (ignoreInvalidSymbols) {
      parameters.set('ignoreInvalidSymbols', ignoreInvalidSymbols)
    }

    return this.#fetchPath(`ticker?${parameters}`)
  }

  historicalPrice = async ({
    assets,
    fiatArray,
    granularity,
    limit,
    timestamp,
    ignoreInvalidSymbols,
  }) => {
    const parameters = new URLSearchParams({
      from: assets,
      to: fiatArray,
      granularity,
      limit,
      timestamp:
        timestamp ||
        dayjs.utc(SynchronizedTime.now()).subtract(1, granularity).startOf(granularity).unix(),
    })
    if (ignoreInvalidSymbols) {
      parameters.set('ignoreInvalidSymbols', ignoreInvalidSymbols)
    }

    return this.#fetchPath(
      `historical-price?${parameters}`,
      merge({}, this.#defaultFetchOptions, {
        headers: { 'Cache-Control': 'max-age=3600' },
      })
    )
  }

  stakingRewards = async () => {
    return this.#fetchPath('staking/rewards')
  }

  movers = async (limit = 10) => {
    const parameters = new URLSearchParams({ limit })

    return this.#fetchPath(`movers?${parameters}`)
  }

  realTimePrice = async ({
    asset,
    fiatCurrency = 'USD',
    ignoreInvalidSymbols = IGNORE_INVALID_SYMBOLS,
  }) => {
    const parameters = new URLSearchParams({
      to: fiatCurrency,
    })

    if (ignoreInvalidSymbols) {
      parameters.set('ignoreInvalidSymbols', ignoreInvalidSymbols)
    }

    const path = asset
      ? `real-time-pricing/${asset}?${parameters}`
      : `real-time-pricing?${parameters}`

    return this.#fetchPath(path, {
      ...this.#defaultFetchOptions,
      headers: {
        ...this.#defaultFetchOptions.headers,
        'Cache-Control': 'max-age=20',
      },
    })
  }
}

const createExodusPricingClient = (opts) => new ExodusPricingClient(opts)

const pricingClientDefinition = {
  id: 'pricingClient',
  type: 'module',
  factory: createExodusPricingClient,
  dependencies: ['fetch', 'pricingServerUrlAtom', 'headers?'],
  public: true,
}

export default pricingClientDefinition
