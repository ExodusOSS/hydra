import { createInMemoryAtom } from '@exodus/atoms'
import { createMockFetch } from '@exodus/mock-fetch'
import ms from 'ms'
import * as path from 'path'

import { MODULE_ID } from '../monitor'
import createGeolocationMonitor from '../monitor/geolocation'

describe('geolocation', () => {
  let geolocationAtom
  let fetch
  let monitor
  let getBuildMetadata

  beforeAll(() => {
    fetch = createMockFetch(path.join(__dirname, 'responses.json'))
    getBuildMetadata = async () => ({
      appId: 'testing-geolocation',
      dev: false,
      build: 'browser',
      version: '23.0.0',
      platformName: 'darwin',
    })
  })

  beforeEach(() => {
    geolocationAtom = createInMemoryAtom()
  })

  afterEach(() => {
    monitor?.stop()
  })

  it('should export correct MODULE_ID', () => {
    expect(MODULE_ID).toEqual('geolocation')
  })

  it('should uses right appName & appVersion calling the api', async () => {
    const fakeFetch = jest.fn().mockImplementation((_, options) => {
      const { headers } = options
      // we inject the headers in response data to check it
      return Promise.resolve({
        headers: {
          get: () => new Date().toUTCString(),
        },
        status: 200,
        json: async () => ({
          data: {
            headers,
            ip: '1.2.3',
            countryCode: 'US',
            regionCode: 'GO',
            regionName: 'Gotham Metro',
            timezoneName: 'GMT +02:00 (US/Gotham)',
            isAllowed: true,
          },
        }),
      })
    })

    monitor = createGeolocationMonitor({
      fetch: fakeFetch,
      geolocationAtom,
      config: {
        apiUrl: 'https://exchange-s.exodus.io/v3/geolocation',
        fetchInterval: ms('5m'),
      },
      getBuildMetadata,
    })
    monitor.start()
    await new Promise((resolve) => setTimeout(resolve, 10))
    const result = await geolocationAtom.get()

    expect(result.data.headers['App-Name']).toBe('testing-geolocation')
    expect(result.data.headers['App-Version']).toBe('23.0.0')
  })

  it('should write location to atom', (done) => {
    expect.assertions(1)
    monitor = createGeolocationMonitor({
      fetch,
      geolocationAtom,
      config: {
        apiUrl: 'https://exchange-s.exodus.io/v3/geolocation',
        fetchInterval: ms('5m'),
      },
      getBuildMetadata,
    })

    geolocationAtom.observe((geolocation) => {
      expect(geolocation).toEqual({
        isAllowed: true,
        ip: '1.2.3',
        countryCode: 'US',
        regionCode: 'GO',
        regionName: 'Gotham Metro',
        timezoneName: 'GMT +02:00 (US/Gotham)',
      })
      done()
    })

    monitor.start()
  })

  it('should write error to atom', (done) => {
    expect.assertions(1)
    monitor = createGeolocationMonitor({
      fetch,
      logger: console,
      geolocationAtom,
      config: { apiUrl: 'https://exchange.exodus.io/geo-location-error', fetchInterval: ms('5m') },

      getBuildMetadata,
    })

    geolocationAtom.observe((geolocation) => {
      expect(geolocation).toEqual({ error: 'Getting location failed.' })
      done()
    })

    monitor.start()
  })
})
