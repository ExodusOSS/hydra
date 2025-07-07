import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'

describe('performanceMonitor', () => {
  let adapters
  let port
  let exodus
  let onAboveThreshold

  const setup = (enabled) => {
    onAboveThreshold = jest.fn()

    adapters = createAdapters({
      performance: {
        onAboveThreshold,
      },
    })

    port = adapters.port

    const container = createExodus({
      adapters,
      config: {
        ...config,
        ioc: {
          ...config.ioc,
          performanceMonitor: {
            threshold: 0,
            enabled,
          },
        },
      },
      port,
    })

    exodus = container.resolve()
  }

  it('should call onAboveThreshold', async () => {
    setup(true)

    await exodus.application.start()
    expect(onAboveThreshold.mock.calls.length).toBeGreaterThan(0)

    await exodus.application.stop()
  })

  it('should not call onAboveThreshold if disabled', async () => {
    setup(false)

    await exodus.application.start()
    expect(onAboveThreshold).not.toHaveBeenCalled()

    await exodus.application.stop()
  })
})
