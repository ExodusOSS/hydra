import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'

describe('assets-feature', () => {
  const passphrase = 'my-password-manager-generated-this'

  test('should create customTokensMonitor', async () => {
    const adapters = createAdapters()

    const container = createExodus({ adapters, config })

    container.resolve()

    const customTokensMonitor = container.get('customTokensMonitor')
    expect(customTokensMonitor).toBeDefined()
  })

  test('should not create customTokensMonitor', async () => {
    const adapters = createAdapters()
    delete adapters.customTokensStorage // no customTokensStorage, no monitor

    const container = createExodus({ adapters, config })

    container.resolve()

    expect(() => container.get('customTokensMonitor')).toThrow(/dependency not found/)
  })

  test('should emit asset preferences', async () => {
    const adapters = createAdapters()

    const port = adapters.port

    const container = createExodus({ adapters, config })

    const exodus = container.resolve()
    const multiAddressModePromise = expectEvent({ port, event: 'multiAddressMode' })
    const disabledPurposesPromise = expectEvent({ port, event: 'disabledPurposes' })

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    await multiAddressModePromise
    await disabledPurposesPromise

    await exodus.application.stop()
  })

  test('integration example', async () => {
    const adapters = createAdapters()

    const container = createExodus({ adapters, config })
    const terribleTickersFeature = () => ({
      id: 'tickers',
      definitions: [
        {
          definition: {
            id: 'tickers',
            type: 'api',
            factory: ({ assetsAtom }) => ({
              tickers: {
                get: async (name) => {
                  const { value: assets } = await assetsAtom.get()
                  return assets[name].ticker
                },
              },
            }),
            // provided by `@exodus/assets-feature`
            dependencies: ['assetsAtom'],
          },
        },
      ],
    })

    container.use(terribleTickersFeature())
    const exodus = container.resolve()
    await expect(exodus.tickers.get('bitcoin')).resolves.toEqual('BTC')
  })
})
