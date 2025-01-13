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
      const actual = await exodusPricingServer.currentPrice({
        assets: ['ethereum', 'bitcoin'],
        fiatCurrency: 'USD',
        ignoreInvalidSymbols: false,
      })

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/current-price?from=${encodeURIComponent('ethereum,bitcoin')}&to=USD`,
        fetchOptions
      )

      expect(actual).toEqual(responseJson)
    })

    it('should request USD in addition to other fiat', async () => {
      const actual = await exodusPricingServer.currentPrice({
        assets: ['ethereum'],
        fiatCurrency: 'EUR',
        ignoreInvalidSymbols: false,
      })

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/current-price?from=ethereum&to=${encodeURIComponent('EUR,USD')}`,
        fetchOptions
      )

      expect(actual).toEqual(responseJson)
    })

    it('should set ignoreInvalidSymbols query param to true', async () => {
      const actual = await exodusPricingServer.currentPrice({
        assets: ['ethereum'],
        fiatCurrency: 'USD',
        ignoreInvalidSymbols: true,
      })

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/current-price?from=ethereum&to=USD&ignoreInvalidSymbols=true`,
        fetchOptions
      )

      expect(actual).toEqual(responseJson)
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
  })

  describe('realTimePrice', () => {
    it('should fetch real-time price for specific asset', async () => {
      const actual = await exodusPricingServer.realTimePrice({
        asset: 'BTC',
        fiatCurrency: 'USD',
        ignoreInvalidSymbols: false,
      })

      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/real-time-pricing/BTC?to=USD`, {
        ...fetchOptions,
        headers: {
          ...fetchOptions.headers,
          'Cache-Control': 'max-age=20',
        },
      })

      expect(actual).toEqual(responseJson)
    })

    it('should fetch real-time prices for top assets', async () => {
      const actual = await exodusPricingServer.realTimePrice({
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

      expect(actual).toEqual(responseJson)
    })
  })

  function mockResponse(json) {
    return {
      ok: true,
      json: async () => json,
    }
  }
})
