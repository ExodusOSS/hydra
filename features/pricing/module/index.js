import { SynchronizedTime } from '@exodus/basic-utils'
import dayjs from '@exodus/dayjs'
import lodash from 'lodash'

const { merge } = lodash

const IGNORE_INVALID_SYMBOLS = true

const MODIFY_CHECK_HEADERS = {
  IF_MODIFIED_SINCE: 'If-Modified-Since',
  IF_NONE_MATCH: 'If-None-Match',
}

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

  #pathUrl = async (path) => {
    const baseUrl = await this.#pricingServerUrlAtom.get()

    return `${baseUrl}/${path}`
  }

  #fetchPath = async (path, options = this.#defaultFetchOptions) => {
    const response = await this.#fetchPathResponse(path, options)

    if (!response.ok) {
      const url = await this.#pathUrl(path)

      // Throw an error here because the calling function is expecting it.
      throw new Error(`${url} ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  #fetchPathResponse = async (path, options = this.#defaultFetchOptions) => {
    const url = await this.#pathUrl(path)

    return this.#fetch(url, options)
  }

  currentPrice = async (params) => {
    const {
      assets,
      lastModified,
      entityTag,
      fiatCurrency = 'USD',
      ignoreInvalidSymbols = IGNORE_INVALID_SYMBOLS,
    } = params
    const parameters = new URLSearchParams({
      from: assets,
      // USD is required in other parts of the application and must be included in all queries
      to: fiatCurrency === 'USD' ? fiatCurrency : [fiatCurrency, 'USD'],
    })
    if (ignoreInvalidSymbols) {
      parameters.set('ignoreInvalidSymbols', ignoreInvalidSymbols)
    }

    const currentPricePath = `current-price?${parameters}`

    const modifyChecksEnabled =
      params.hasOwnProperty('lastModified') || params.hasOwnProperty('entityTag')

    if (!modifyChecksEnabled) {
      return this.#fetchPath(currentPricePath)
    }

    const fetchOptions = {
      ...this.#defaultFetchOptions,
      headers: {
        ...this.#defaultFetchOptions.headers,
      },
    }
    if (lastModified) {
      fetchOptions.headers[MODIFY_CHECK_HEADERS.IF_MODIFIED_SINCE] = lastModified
    }

    if (entityTag) {
      fetchOptions.headers[MODIFY_CHECK_HEADERS.IF_NONE_MATCH] = entityTag
    }

    const response = await this.#fetchPathResponse(currentPricePath, fetchOptions)
    const responseLastModified = response.headers.get('Last-Modified')
    const responseEntityTag = response.headers.get('ETag')

    if (
      response.status === 304 ||
      // fetch can internally convert 304 into 200, so check for modify headers on request/response
      (response.ok && lastModified && lastModified === responseLastModified) ||
      (response.ok && entityTag && entityTag === responseEntityTag)
    ) {
      return {
        isModified: false,
      }
    }

    if (response.ok) {
      const data = await response.json()

      return {
        entityTag: responseEntityTag,
        lastModified: responseLastModified,
        isModified: true,
        data,
      }
    }

    const url = await this.#pathUrl(currentPricePath)
    throw new Error(`${url} ${response.status} ${response.statusText}`)
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
