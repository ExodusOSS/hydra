import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'

function mockResponse(json) {
  return {
    ok: true,
    json: async () => json,
    headers: new Map([['Date', new Date()]]),
  }
}

describe('pricingClient', () => {
  let adapters
  let container
  let fetch

  beforeEach(async () => {
    fetch = jest.fn().mockImplementation(async (url) => {
      const responseJSON = url.startsWith(config.remoteConfig.remoteConfigUrl) ? { data: {} } : {}
      return mockResponse(responseJSON)
    })

    adapters = createAdapters({ fetch })
    container = createExodus({ adapters, config })

    container.resolve()
    await container.get('remoteConfigAtom').set({ config: {} })
  })

  test('pricingClient is available', async () => {
    const { pricingClient } = container.getAll()
    await pricingClient.currentPrice({
      assets: ['ethereum', 'bitcoin'],
      fiatCurrency: 'USD',
      ignoreInvalidSymbols: false,
    })

    expect(
      fetch.mock.calls.some(
        ([url]) =>
          url ===
          `${
            config.pricingServerUrlAtom.defaultPricingServerUrl
          }/current-price?${new URLSearchParams({ from: ['ethereum', 'bitcoin'], to: 'USD' })}`
      )
    ).toBeTruthy()
  })
})
