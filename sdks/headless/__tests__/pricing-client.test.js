import createAdapters from './adapters'
import config from './config'
import createExodus from './exodus'

function mockResponse(json) {
  return {
    ok: true,
    json: async () => json,
    headers: new Map([['Date', new Date()]]),
  }
}

const passphrase = 'my-password-manager-generated-this'

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

    const exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })
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
