import createAdapters from '../adapters'
import config from '../config'
import createExodus from '../exodus'

describe('reporting', () => {
  let exodus
  let adapters

  beforeEach(async () => {
    adapters = createAdapters()

    const container = createExodus({ adapters, config })
    exodus = container.resolve()
  })

  test('report pre-wallet-exists', async () => {
    await exodus.application.start()
    await exodus.application.load()
    await expect(exodus.wallet.exists()).resolves.toBe(false)
    await expect(exodus.reporting.export()).resolves.toMatchObject({
      application: {
        createdAt: null,
        isLocked: true,
        isBackedUp: false,
        isRestoring: false,
      },
    })
  })

  test('report post-wallet-exists', async () => {
    await exodus.application.start()
    await exodus.application.create()
    await exodus.application.unlock()
    await expect(exodus.wallet.exists()).resolves.toBe(true)
    await expect(exodus.reporting.export()).resolves.toMatchObject({
      application: {
        createdAt: expect.any(String),
        isLocked: false,
        isBackedUp: false,
        isRestoring: false,
      },
    })
  })
})
