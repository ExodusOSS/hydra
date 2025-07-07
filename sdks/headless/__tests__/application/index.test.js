import createAdapters from '../adapters/index.js'
import config from '../config.js'
import createExodus from '../exodus.js'

describe('reporting', () => {
  let exodus
  let adapters
  let reportNode

  beforeEach(async () => {
    adapters = createAdapters()

    const container = createExodus({ adapters, config })
    exodus = container.resolve()

    reportNode = container.getByType('report').applicationReport
  })

  test('should successfully export report (pre-wallet-exists)', async () => {
    await exodus.application.start()
    await exodus.application.load()
    await expect(exodus.wallet.exists()).resolves.toBe(false)
    await expect(exodus.wallet.isLocked()).resolves.toBe(true)
    await expect(exodus.reporting.export()).resolves.toMatchObject({
      application: await reportNode.export({
        walletExists: await exodus.wallet.exists(),
        isLocked: await exodus.wallet.isLocked(),
      }),
    })

    await exodus.application.stop()
  })

  test('should successfully export report (post-wallet-exists)', async () => {
    await exodus.application.start()
    await exodus.application.create()
    await exodus.application.unlock()
    await expect(exodus.wallet.exists()).resolves.toBe(true)
    await expect(exodus.wallet.isLocked()).resolves.toBe(false)
    await expect(exodus.reporting.export()).resolves.toMatchObject({
      application: await reportNode.export({
        walletExists: await exodus.wallet.exists(),
        isLocked: await exodus.wallet.isLocked(),
      }),
    })

    await exodus.application.stop()
  })
})
