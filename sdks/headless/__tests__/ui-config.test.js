import uiConfig from '@exodus/ui-config'

import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'

describe('ui-config', () => {
  let exodus

  let adapters

  let port

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    adapters = createAdapters()

    port = adapters.port

    const container = createExodus({ adapters, config })

    container.use(
      uiConfig({
        config: {
          delightUser: { id: 'delightUser' },
          soundsEnabled: { id: 'soundsEnabled', syncable: true },
        },
      })
    )

    exodus = container.resolve()
  })

  test('should load ui-config data when enabled', async () => {
    const eventPromise1 = expectEvent({ port, event: 'delightUser' })
    const eventPromise2 = expectEvent({ port, event: 'soundsEnabled' })
    await exodus.application.start()
    await exodus.application.load()

    await eventPromise1
    await eventPromise2

    await exodus.application.stop()
  })

  test('uiConfig API should work', async () => {
    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    exodus.uiConfig.delightUser.set(true)
    await expect(expectEvent({ port, event: 'delightUser' })).resolves.toEqual(true)

    exodus.uiConfig.delightUser.set(false)
    await expect(expectEvent({ port, event: 'delightUser' })).resolves.toEqual(false)

    await exodus.application.stop()
  })

  test('should keep syncable configs synced with fusion', async () => {
    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    // Syncs local -> fusion
    exodus.uiConfig.soundsEnabled.set(true)
    await expect(expectEvent({ port, event: 'soundsEnabled' })).resolves.toEqual(true)
    await expect(adapters.fusion.getProfile()).resolves.toMatchObject({ soundsEnabled: true })

    exodus.uiConfig.soundsEnabled.set(false)
    await expect(expectEvent({ port, event: 'soundsEnabled' })).resolves.toEqual(false)
    await expect(adapters.fusion.getProfile()).resolves.toMatchObject({ soundsEnabled: false })

    // Syncs fusion -> local
    await adapters.fusion.mergeProfile({ soundsEnabled: true })
    await new Promise(setImmediate)
    await expect(exodus.uiConfig.soundsEnabled.get()).resolves.toEqual(true)

    await adapters.fusion.mergeProfile({ soundsEnabled: false })
    await new Promise(setImmediate)
    await expect(exodus.uiConfig.soundsEnabled.get()).resolves.toEqual(false)

    await exodus.application.stop()
  })
})
