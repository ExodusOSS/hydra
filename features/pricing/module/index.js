import { SynchronizedTime } from '@exodus/basic-utils'
import dayjs from '@exodus/dayjs'
import lodash from 'lodash'

const { merge } = lodash

const IGNORE_INVALID_SYMBOLS = true

const MODIFY_CHECK_HEADERS = {
  IF_MODIFIED_SINCE: 'If-Modified-Since',
  IF_NONE_MATCH: 'If-None-Match',
}

const REALTIME_HEADERS = {
  'Cache-Control': 'max-age=20',
}

// on mobile platform, globally available 'URLSearchParams' is quite slow
// this implementation (based of react-native/Library/Blob/URL) is subset of "whatwg-url"
// covers the usage patterns we have while being faster than "whatwg-url" implementation
function unsafeEncodeSearchParams(searchParams) {
  const searchParamEntries = Object.entries(searchParams)
  if (searchParamEntries.length === 0) {
    return ''
  }

  const last = searchParamEntries.length - 1

  return searchParamEntries.reduce((acc, curr, index) => {
    return (
      acc +
      encodeURIComponent(curr[0]) +
      '=' +
      encodeURIComponent(curr[1]) +
      (index === last ? '' : '&')
    )
  }, '')
}

class ExodusPricingClient {
  #defaultFetchOptions
  #pricingServerUrlAtom
  #fetch

  constructor({ pricingServerUrlAtom, fetch, headers = {} }) {
    this.#pricingServerUrlAtom = pricingServerUrlAtom

    this.#defaultFetchOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=60',
        ...headers,
      },
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

  async #postProcessResponse({ response, path }) {
    if (response.ok) {
      const data = await response.json()
      return {
        isModified: true,
        data,
        lastModified: response.headers.get('Last-Modified') ?? null,
        entityTag: response.headers.get('ETag') ?? null,
      }
    }

    const url = await this.#pathUrl(path)
    throw new Error(`${url} ${response.status} ${response.statusText}`)
  }

  async #checkIfModified({ response, path, lastModified, entityTag }) {
    const responseLastModified = response.headers.get('Last-Modified')
    const responseEntityTag = response.headers.get('ETag')

    if (
      response.status === 304 ||
      (response.ok && lastModified && lastModified === responseLastModified) ||
      (response.ok && entityTag && entityTag === responseEntityTag)
    ) {
      return { isModified: false }
    }

    return this.#postProcessResponse({ response, path })
  }

  currentPrice = async (params) => {
    const {
      assets,
      lastModified,
      entityTag,
      fiatCurrency = 'USD',
      ignoreInvalidSymbols = IGNORE_INVALID_SYMBOLS,
    } = params

    const searchParams = {
      __proto__: null,
      from: assets,
      to: fiatCurrency === 'USD' ? fiatCurrency : [fiatCurrency, 'USD'],
    }
    if (ignoreInvalidSymbols) {
      searchParams.ignoreInvalidSymbols = ignoreInvalidSymbols
    }

    const currentPricePath = `current-price?${unsafeEncodeSearchParams(searchParams)}`

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
    return this.#checkIfModified({
      response,
      path: currentPricePath,
      lastModified,
      entityTag,
    })
  }

  ticker = async ({
    assets,
    fiatCurrency = 'USD',
    ignoreInvalidSymbols = IGNORE_INVALID_SYMBOLS,
  }) => {
    const searchParams = {
      __proto__: null,
      from: assets,
      to: fiatCurrency,
    }
    if (ignoreInvalidSymbols) {
      searchParams.ignoreInvalidSymbols = ignoreInvalidSymbols
    }

    return this.#fetchPath(`ticker?${unsafeEncodeSearchParams(searchParams)}`)
  }

  historicalPrice = async ({
    assets,
    fiatArray,
    granularity,
    limit,
    timestamp,
    ignoreInvalidSymbols,
  }) => {
    const searchParams = {
      __proto__: null,
      from: assets,
      to: fiatArray,
      granularity,
      limit,
      timestamp:
        timestamp ||
        dayjs.utc(SynchronizedTime.now()).subtract(1, granularity).startOf(granularity).unix(),
    }

    if (ignoreInvalidSymbols) {
      searchParams.ignoreInvalidSymbols = ignoreInvalidSymbols
    }

    return this.#fetchPath(
      `historical-price?${unsafeEncodeSearchParams(searchParams)}`,
      merge({}, this.#defaultFetchOptions, {
        headers: { 'Cache-Control': 'max-age=3600' },
      })
    )
  }

  stakingRewards = async () => {
    return this.#fetchPath('staking/rewards')
  }

  movers = async (limit = 10) => {
    const searchParams = {
      __proto__: null,
      limit,
    }
    return this.#fetchPath(`movers?${unsafeEncodeSearchParams(searchParams)}`)
  }

  realTimePrice = async (params = {}) => {
    const {
      asset,
      lastModified,
      entityTag,
      fiatCurrency = 'USD',
      ignoreInvalidSymbols = IGNORE_INVALID_SYMBOLS,
    } = params

    const searchParams = {
      __proto__: null,
      to: fiatCurrency,
    }
    if (ignoreInvalidSymbols) {
      searchParams.ignoreInvalidSymbols = ignoreInvalidSymbols
    }

    const encodedSearchParams = unsafeEncodeSearchParams(searchParams)

    const path = asset
      ? `real-time-pricing/${asset}?${encodedSearchParams}`
      : `real-time-pricing?${encodedSearchParams}`

    const modifyChecksEnabled = !!(lastModified || entityTag)

    if (!modifyChecksEnabled) {
      const response = await this.#fetchPathResponse(path, {
        ...this.#defaultFetchOptions,
        headers: {
          ...this.#defaultFetchOptions.headers,
          ...REALTIME_HEADERS,
        },
      })
      return this.#postProcessResponse({ response, path })
    }

    const fetchOptions = {
      ...this.#defaultFetchOptions,
      headers: {
        ...this.#defaultFetchOptions.headers,
        ...REALTIME_HEADERS,
      },
    }
    if (lastModified) {
      fetchOptions.headers[MODIFY_CHECK_HEADERS.IF_MODIFIED_SINCE] = lastModified
    }

    if (entityTag) {
      fetchOptions.headers[MODIFY_CHECK_HEADERS.IF_NONE_MATCH] = entityTag
    }

    const response = await this.#fetchPathResponse(path, fetchOptions)
    return this.#checkIfModified({
      response,
      path,
      lastModified,
      entityTag,
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
