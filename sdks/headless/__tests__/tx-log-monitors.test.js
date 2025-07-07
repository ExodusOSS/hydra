import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'

describe('txLogMonitors', () => {
  let container
  let adapters

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    adapters = createAdapters()
    container = createExodus({ adapters, config })
  })

  test('should start monitors on unlock', async () => {
    const exodus = container.resolve()

    const { bitcoin } = await exodus.assets.getAssets()

    const startMock = jest.fn()
    const stopMock = jest.fn()
    bitcoin.api.createHistoryMonitor = jest.fn(() => ({
      start: startMock,
      stop: stopMock, // called during application stop
      addHook: jest.fn(),
    }))

    await exodus.application.start()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    // txLogMonitor.start does not await for monitors to start
    await new Promise(setImmediate)

    expect(bitcoin.api.createHistoryMonitor).toHaveBeenCalledTimes(1)
    expect(startMock).toHaveBeenCalledTimes(1)

    expect(stopMock).toHaveBeenCalledTimes(0)
    await exodus.application.stop()
    expect(stopMock).toHaveBeenCalledTimes(1)
  })

  test('should stop monitors on lock', async () => {
    const exodus = container.resolve()

    const { bitcoin } = await exodus.assets.getAssets()

    const stopMock = jest.fn()
    bitcoin.api.createHistoryMonitor = jest.fn(() => ({ stop: stopMock, addHook: jest.fn() }))

    await exodus.application.start()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    // txLogMonitor.start does not await for monitors to start
    await new Promise(setImmediate)

    await exodus.application.lock()

    expect(stopMock).toHaveBeenCalledTimes(1)

    await exodus.application.stop()
  })
})
