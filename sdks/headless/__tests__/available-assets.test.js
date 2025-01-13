import createAdapters from './adapters'
import config from './config'
import createExodus from './exodus'
import expectEvent from './expect-event'

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
  })
})
