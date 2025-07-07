import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'

describe('instance', () => {
  let adapters = createAdapters()

  beforeEach(async () => {
    adapters = createAdapters()
  })

  test('should use port passed through adapters', () => {
    const { port } = adapters
    port.subscribe = jest.fn()

    const container = createExodus({ adapters, config })
    const exodus = container.resolve()
    exodus.subscribe(() => {})
    expect(port.subscribe).toHaveBeenCalled()
  })
})
