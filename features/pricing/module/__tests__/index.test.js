import { SynchronizedTime } from '@exodus/basic-utils'
import dayjs from '@exodus/dayjs'
import lodash from 'lodash'

import pricingClientDefinition from '../index.js'

const { merge } = lodash

describe('ExodusPricingClient', () => {
  const defaultOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=60' },
  }
  const additionalHeaders = { source: 'jest in hydra' }
  const fetchOptions = {
    ...defaultOptions,
    headers: {
      ...defaultOptions.headers,
      ...additionalHeaders,
    },
  }

  const baseUrl = 'https://exodus-pricing.com'
  const pricingServerUrlAtom = {
    get: async () => baseUrl,
  }

  let fetch
  let exodusPricingServer

  const responseJson = { the: 'content' }
  beforeEach(() => {
    fetch = jest.fn()
    exodusPricingServer = pricingClientDefinition.factory({
      fetch,
      pricingServerUrlAtom,
      headers: additionalHeaders,
    })
    fetch.mockResolvedValue(mockResponse(responseJson))
  })

  describe('currentPrice', () => {
    it('should call pricing server with currency and assets', async () => {
      const currentPrice = await exodusPricingServer.currentPrice({
        assets: ['ethereum', 'bitcoin'],
        fiatCurrency: 'USD',
        ignoreInvalidSymbols: false,
      })

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/current-price?from=${encodeURIComponent('ethereum,bitcoin')}&to=USD`,
        fetchOptions
      )

      expect(currentPrice).toEqual(responseJson)
    })

    it('should request USD in addition to other fiat', async () => {
      const currentPrice = await exodusPricingServer.currentPrice({
        assets: ['ethereum'],
        fiatCurrency: 'EUR',
        ignoreInvalidSymbols: false,
      })

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/current-price?from=ethereum&to=${encodeURIComponent('EUR,USD')}`,
        fetchOptions
      )

      expect(currentPrice).toEqual(responseJson)
    })

    it('should set ignoreInvalidSymbols query param to true', async () => {
      const currentPrice = await exodusPricingServer.currentPrice({
        assets: ['ethereum'],
        fiatCurrency: 'USD',
        ignoreInvalidSymbols: true,
      })

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/current-price?from=ethereum&to=USD&ignoreInvalidSymbols=true`,
        fetchOptions
      )

      expect(currentPrice).toEqual(responseJson)
    })

    it.each([
      [{ ok: false, status: 306, statusText: 'Switch Proxy' }],
      [{ ok: false, status: 500, statusText: 'Internal Server Error' }],
    ])('should throw error when response has (%s)', async (responseOverrides) => {
      fetch.mockResolvedValue(mockResponse(responseJson, responseOverrides))

      const currentPriceCall = () =>
        exodusPricingServer.currentPrice({
          assets: ['ethereum', 'bitcoin'],
          fiatCurrency: 'USD',
          ignoreInvalidSymbols: false,
        })

      await expect(currentPriceCall).rejects.toThrow(
        `${baseUrl}/current-price?from=ethereum%2Cbitcoin&to=USD ${responseOverrides.status} ${responseOverrides.statusText}`
      )
    })

    describe('modify checks', () => {
      it('should set "If-Modified-Since" header if "lastModified" is provided', async () => {
        await exodusPricingServer.currentPrice({
          assets: ['ethereum'],
          lastModified: 'Thu, 02 Jan 2025 10:06:46 GMT',
        })

        const expectedFetchOptions = {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            'If-Modified-Since': 'Thu, 02 Jan 2025 10:06:46 GMT',
          },
        }

        expect(fetch).toHaveBeenCalledWith(
          `${baseUrl}/current-price?from=ethereum&to=USD&ignoreInvalidSymbols=true`,
          expectedFetchOptions
        )
      })

      it('should return result with "IsModified" wrapper, even when undefined is passed explicitly for lastModified', async () => {
        const currentPrice = await exodusPricingServer.currentPrice({
          assets: ['ethereum'],
          lastModified: undefined,
        })

        expect(fetch).toHaveBeenCalledWith(
          `${baseUrl}/current-price?from=ethereum&to=USD&ignoreInvalidSymbols=true`,
          fetchOptions
        )

        expect(currentPrice).toHaveProperty('entityTag', 'lastModified', 'isModified', 'data')
      })

      it('should set "If-None-Match" header if "entityTag" is provided', async () => {
        await exodusPricingServer.currentPrice({
          assets: ['ethereum'],
          entityTag: 'xyz',
        })

        const expectedFetchOptions = {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            'If-None-Match': 'xyz',
          },
        }

        expect(fetch).toHaveBeenCalledWith(
          `${baseUrl}/current-price?from=ethereum&to=USD&ignoreInvalidSymbols=true`,
          expectedFetchOptions
        )
      })

      it('should set both "If-None-Match" & "If-Modified-Since" headers if relevant params provided', async () => {
        await exodusPricingServer.currentPrice({
          assets: ['ethereum'],
          entityTag: 'xyz',
          lastModified: 'Thu, 02 Jan 2025 10:06:46 GMT',
        })

        const expectedFetchOptions = {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            'If-None-Match': 'xyz',
            'If-Modified-Since': 'Thu, 02 Jan 2025 10:06:46 GMT',
          },
        }

        expect(fetch).toHaveBeenCalledWith(
          `${baseUrl}/current-price?from=ethereum&to=USD&ignoreInvalidSymbols=true`,
          expectedFetchOptions
        )
      })

      it('should return "isModified: false" without "data" when data has not changed', async () => {
        fetch.mockResolvedValue(
          mockResponse(responseJson, {
            ok: false,
            status: 304,
            statusText: 'Not Modified',
          })
        )

        const currentPrice = await exodusPricingServer.currentPrice({
          assets: ['ethereum'],
          lastModified: 'Thu, 02 Jan 2025 10:06:46 GMT',
        })

        const expectedFetchOptions = {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            'If-Modified-Since': 'Thu, 02 Jan 2025 10:06:46 GMT',
          },
        }

        expect(fetch).toHaveBeenCalledWith(
          `${baseUrl}/current-price?from=ethereum&to=USD&ignoreInvalidSymbols=true`,
          expectedFetchOptions
        )

        expect(currentPrice.isModified).toEqual(false)
        expect(currentPrice.data).toEqual(undefined)
      })

      it('should return "isModified: false" even when response is OK but lastModifieds are matching', async () => {
        fetch.mockResolvedValue(
          mockResponse(responseJson, {
            ok: true,
            status: 200,
            headers: {
              get: jest.fn(
                (header) =>
                  ({
                    'Last-Modified': 'Thu, 02 Jan 2025 10:06:46 GMT',
                  })[header]
              ),
            },
          })
        )

        const currentPrice = await exodusPricingServer.currentPrice({
          assets: ['ethereum'],
          lastModified: 'Thu, 02 Jan 2025 10:06:46 GMT',
        })

        const expectedFetchOptions = {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            'If-Modified-Since': 'Thu, 02 Jan 2025 10:06:46 GMT',
          },
        }

        expect(fetch).toHaveBeenCalledWith(
          `${baseUrl}/current-price?from=ethereum&to=USD&ignoreInvalidSymbols=true`,
          expectedFetchOptions
        )

        expect(currentPrice.isModified).toEqual(false)
        expect(currentPrice.data).toEqual(undefined)
      })

      it('should return "isModified: true" with "data" when data has changed', async () => {
        fetch.mockResolvedValue(
          mockResponse(responseJson, {
            ok: true,
            status: 200,
            statusText: 'ok',
            headers: {
              get: jest.fn(
                (header) =>
                  ({
                    ETag: 'abc',
                    'Last-Modified': 'Thu, 02 Jan 2025 10:07:46 GMT',
                  })[header]
              ),
            },
          })
        )

        const currentPrice = await exodusPricingServer.currentPrice({
          assets: ['ethereum'],
          lastModified: 'dummy-date-that-doesnt-match',
        })

        const expectedFetchOptions = {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            'If-Modified-Since': 'dummy-date-that-doesnt-match',
          },
        }

        expect(fetch).toHaveBeenCalledWith(
          `${baseUrl}/current-price?from=ethereum&to=USD&ignoreInvalidSymbols=true`,
          expectedFetchOptions
        )

        expect(currentPrice.isModified).toEqual(true)
        expect(currentPrice.data).toEqual(responseJson)
        expect(currentPrice.entityTag).toEqual('abc')
        expect(currentPrice.lastModified).toEqual('Thu, 02 Jan 2025 10:07:46 GMT')
      })
    })
  })

  describe('ticker', () => {
    it('should call pricing server with assets and fiat currency', async () => {
      const actual = await exodusPricingServer.ticker({
        assets: ['ethereum', 'bitcoin'],
        fiatCurrency: 'BAT',
        ignoreInvalidSymbols: false,
      })

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/ticker?from=${encodeURIComponent('ethereum,bitcoin')}&to=BAT`,
        fetchOptions
      )

      expect(actual).toEqual(responseJson)
    })

    it('should set ignoreInvalidSymbols query param to true', async () => {
      const actual = await exodusPricingServer.ticker({
        assets: ['ethereum'],
        fiatCurrency: 'USD',
        ignoreInvalidSymbols: true,
      })

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/ticker?from=ethereum&to=USD&ignoreInvalidSymbols=true`,
        fetchOptions
      )

      expect(actual).toEqual(responseJson)
    })

    it.each([
      [{ ok: false, status: 304, statusText: 'Not Modified' }],
      [{ ok: false, status: 500, statusText: 'Internal Server Error' }],
    ])('should throw error when response has (%s)', async (responseOverrides) => {
      fetch.mockResolvedValue(mockResponse(responseJson, responseOverrides))

      const tickerCall = () =>
        exodusPricingServer.ticker({
          assets: ['ethereum', 'bitcoin'],
          fiatCurrency: 'BAT',
          ignoreInvalidSymbols: false,
        })

      await expect(tickerCall).rejects.toThrow(
        `${baseUrl}/ticker?from=${encodeURIComponent('ethereum,bitcoin')}&to=BAT ${responseOverrides.status} ${responseOverrides.statusText}`
      )
    })
  })

  describe('historicalPrice', () => {
    const historicalPriceFetchOptions = merge({}, fetchOptions, {
      headers: { 'Cache-Control': 'max-age=3600' },
    })

    it('should fetch with provided parameters', async () => {
      const actual = await exodusPricingServer.historicalPrice({
        assets: ['ethereum', 'bitcoin'],
        fiatArray: ['EUR', 'GBP'],
        limit: 100,
        granularity: 'week',
        timestamp: 'the stamp',
      })

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/historical-price?from=${encodeURIComponent(
          'ethereum,bitcoin'
        )}&to=${encodeURIComponent('EUR,GBP')}&granularity=week&limit=100&timestamp=the+stamp`,
        historicalPriceFetchOptions
      )

      expect(actual).toEqual(responseJson)
    })

    it('should derive timestamp as start of the week', async () => {
      const date = new Date(2022, 9, 28) // 28th of October 2022, Friday

      jest.spyOn(SynchronizedTime, 'now').mockReturnValue(date.getTime())

      const actual = await exodusPricingServer.historicalPrice({
        assets: ['bitcoin'],
        fiatArray: ['EUR'],
        limit: 100,
        granularity: 'week',
      })

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/historical-price?from=bitcoin&to=EUR&granularity=week&limit=100&timestamp=${dayjs
          .utc(date)
          .subtract(1, 'week')
          .startOf('week')
          .unix()}`,
        historicalPriceFetchOptions
      )

      expect(actual).toEqual(responseJson)
    })

    it('should set ignoreInvalidSymbols query param to true', async () => {
      const actual = await exodusPricingServer.historicalPrice({
        assets: ['ethereum'],
        fiatArray: ['USD'],
        ignoreInvalidSymbols: true,
        limit: 42,
        granularity: 'year',
        timestamp: 'the stamp',
      })

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/historical-price?from=ethereum&to=USD&granularity=year&limit=42&timestamp=the+stamp&ignoreInvalidSymbols=true`,
        historicalPriceFetchOptions
      )

      expect(actual).toEqual(responseJson)
    })

    it.each([
      [{ ok: false, status: 304, statusText: 'Not Modified' }],
      [{ ok: false, status: 500, statusText: 'Internal Server Error' }],
    ])('should throw error when response has (%s)', async (responseOverrides) => {
      fetch.mockResolvedValue(mockResponse(responseJson, responseOverrides))

      const historicalPriceCall = () =>
        exodusPricingServer.historicalPrice({
          assets: ['ethereum'],
          fiatArray: ['USD'],
          ignoreInvalidSymbols: true,
          limit: 42,
          granularity: 'year',
          timestamp: 'the stamp',
        })

      await expect(historicalPriceCall).rejects.toThrow(
        `${baseUrl}/historical-price?from=ethereum&to=USD&granularity=year&limit=42&timestamp=the+stamp&ignoreInvalidSymbols=true`
      )
    })
  })

  describe('realTimePrice', () => {
    describe('normal requests (no lastModified, no entityTag)', () => {
      it('should fetch real-time price for a specific asset', async () => {
        const result = await exodusPricingServer.realTimePrice({
          asset: 'BTC',
          fiatCurrency: 'USD',
          ignoreInvalidSymbols: true,
        })

        expect(fetch).toHaveBeenCalledWith(
          `${baseUrl}/real-time-pricing/BTC?to=USD&ignoreInvalidSymbols=true`,
          {
            ...fetchOptions,
            headers: {
              ...fetchOptions.headers,
              'Cache-Control': 'max-age=20',
            },
          }
        )

        expect(result).toEqual({
          isModified: true,
          data: responseJson,
          entityTag: null,
          lastModified: null,
        })
      })

      it('should fetch real-time prices for top assets (no `asset` param)', async () => {
        const result = await exodusPricingServer.realTimePrice({
          fiatCurrency: 'USD',
          ignoreInvalidSymbols: true,
        })

        expect(fetch).toHaveBeenCalledWith(
          `${baseUrl}/real-time-pricing?to=USD&ignoreInvalidSymbols=true`,
          {
            ...fetchOptions,
            headers: {
              ...fetchOptions.headers,
              'Cache-Control': 'max-age=20',
            },
          }
        )

        expect(result).toEqual({
          isModified: true,
          data: responseJson,
          entityTag: null,
          lastModified: null,
        })
      })

      it('should throw error on non-2xx except 304 Not Modified', async () => {
        fetch.mockResolvedValue(
          mockResponse(responseJson, {
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
          })
        )

        await expect(
          exodusPricingServer.realTimePrice({
            fiatCurrency: 'USD',
          })
        ).rejects.toThrow(
          `${baseUrl}/real-time-pricing?to=USD&ignoreInvalidSymbols=true 500 Internal Server Error`
        )
      })
    })

    describe('conditional requests (lastModified, entityTag)', () => {
      it('should return "isModified: false" when server responds 304 Not Modified', async () => {
        fetch.mockResolvedValue(
          mockResponse(responseJson, {
            ok: false,
            status: 304,
            statusText: 'Not Modified',
          })
        )

        const result = await exodusPricingServer.realTimePrice({
          fiatCurrency: 'USD',
          ignoreInvalidSymbols: true,
          lastModified: 'Thu, 02 Jan 2025 10:06:46 GMT',
        })

        expect(result).toEqual({ isModified: false })
      })

      it('should throw error when server responds non-2xx and not 304 (e.g. 500)', async () => {
        fetch.mockResolvedValue(
          mockResponse(responseJson, {
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
          })
        )

        await expect(
          exodusPricingServer.realTimePrice({
            asset: 'BTC',
            lastModified: 'Thu, 02 Jan 2025 10:06:46 GMT',
          })
        ).rejects.toThrow(
          `${baseUrl}/real-time-pricing/BTC?to=USD&ignoreInvalidSymbols=true 500 Internal Server Error`
        )
      })

      it('should set "If-Modified-Since" header if "lastModified" is provided', async () => {
        await exodusPricingServer.realTimePrice({
          asset: 'BTC',
          lastModified: 'Thu, 02 Jan 2025 10:06:46 GMT',
        })

        const expectedFetchOptions = {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            'Cache-Control': 'max-age=20',
            'If-Modified-Since': 'Thu, 02 Jan 2025 10:06:46 GMT',
          },
        }
        expect(fetch).toHaveBeenCalledWith(
          `${baseUrl}/real-time-pricing/BTC?to=USD&ignoreInvalidSymbols=true`,
          expectedFetchOptions
        )
      })

      it('should set "If-None-Match" header if "entityTag" is provided', async () => {
        await exodusPricingServer.realTimePrice({
          asset: 'BTC',
          entityTag: 'xyz',
        })

        const expectedFetchOptions = {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            'Cache-Control': 'max-age=20',
            'If-None-Match': 'xyz',
          },
        }
        expect(fetch).toHaveBeenCalledWith(
          `${baseUrl}/real-time-pricing/BTC?to=USD&ignoreInvalidSymbols=true`,
          expectedFetchOptions
        )
      })

      it('should return "isModified: true" with new data + ETag + Last-Modified when data has changed', async () => {
        fetch.mockResolvedValue(
          mockResponse(responseJson, {
            ok: true,
            status: 200,
            statusText: 'ok',
            headers: {
              get: jest.fn((header) => {
                if (header === 'ETag') return 'abc'
                if (header === 'Last-Modified') return 'Thu, 02 Jan 2025 10:07:46 GMT'
                return null
              }),
            },
          })
        )

        const result = await exodusPricingServer.realTimePrice({
          asset: 'BTC',
          lastModified: 'some-old-date',
        })

        expect(result.isModified).toBe(true)
        expect(result.data).toEqual(responseJson)
        expect(result.entityTag).toBe('abc')
        expect(result.lastModified).toBe('Thu, 02 Jan 2025 10:07:46 GMT')
      })
    })

    describe('modify checks (no explicit lastModified/entityTag)', () => {
      it('should return "isModified: true" by default if no conditional headers are provided', async () => {
        fetch.mockResolvedValue(mockResponse(responseJson, { ok: true, status: 200 }))

        const result = await exodusPricingServer.realTimePrice({ asset: 'BTC' })

        expect(result.isModified).toBe(true)
        expect(result.data).toEqual(responseJson)
        expect(result.entityTag).toBeNull()
        expect(result.lastModified).toBeNull()
      })
    })
  })

  function mockResponse(json, args = {}) {
    return {
      ok: true,
      headers: {
        get: () => null,
      },
      json: async () => json,
      ...args,
    }
  }
})
