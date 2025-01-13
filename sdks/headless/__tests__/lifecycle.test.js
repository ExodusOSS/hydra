import createAdapters from './adapters'
import createExodus from './exodus'

describe('lifecycle', () => {
  let exodus
  let adapters
  let port
  let plugin

  beforeEach(async () => {
    adapters = createAdapters()
    port = adapters.port
    plugin = {
      onStop: jest.fn(),
    }

    const container = createExodus({ adapters, port })
    container.register({
      definition: {
        id: 'the-plugin',
        type: 'plugin',
        factory: () => plugin,
        public: true,
      },
    })

    exodus = container.resolve()
  })

  it('should call onStop', async () => {
    await exodus.wallet.stop()
    expect(plugin.onStop).toHaveBeenCalled()
  })
})
