import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'

describe('availableAssets', () => {
  let adapters

  let port

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    adapters = createAdapters()
    port = adapters.port
  })

  test('availableAssetNamesAtom has default assets', async () => {
    const expectAvailableAssetNames = expectEvent({
      port,
      event: 'availableAssetNames',
      payload: ['bitcoin', 'ethereum'],
    })

    const container = createExodus({ adapters, config })

    const exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    await expectAvailableAssetNames

    await exodus.application.stop()
  })

  test('availableAssets integration example', async () => {
    const container = createExodus({
      adapters,
      config: {
        ...config,
        availableAssets: {
          defaultAvailableAssetNames: ['bitcoin'],
        },
      },
      port,
    })

    // already happens in createExodus
    // container.use(availableAssets())

    const exodus = container.resolve()

    // you need to start to make default available assets take effect
    await exodus.application.start()

    const availableAssetNames = await exodus.availableAssets.get()
    expect(availableAssetNames).toEqual(['bitcoin'])

    await exodus.application.stop()
  })
})
