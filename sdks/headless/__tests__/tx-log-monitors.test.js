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

    await exodus.application.start()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    const { bitcoin } = await exodus.assets.getAssets()
    const bitcoinMonitor = bitcoin.api.createHistoryMonitor()

    expect(bitcoinMonitor.start).toHaveBeenCalledTimes(1)

    expect(bitcoinMonitor.stop).toHaveBeenCalledTimes(0)
    await exodus.application.stop()
    expect(bitcoinMonitor.stop).toHaveBeenCalledTimes(1)
  })

  test('should stop monitors on lock', async () => {
    const exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    const { bitcoin } = await exodus.assets.getAssets()
    const bitcoinMonitor = bitcoin.api.createHistoryMonitor()
    expect(bitcoinMonitor.start).toHaveBeenCalledTimes(1)

    expect(bitcoinMonitor.stop).toHaveBeenCalledTimes(0)

    await exodus.application.lock()

    expect(bitcoinMonitor.stop).toHaveBeenCalledTimes(1)

    await exodus.application.stop()
    expect(bitcoinMonitor.start).toHaveBeenCalledTimes(1)
    expect(bitcoinMonitor.stop).toHaveBeenCalledTimes(1)
  })
})
