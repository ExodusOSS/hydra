import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'

describe('asset-sources', () => {
  let exodus

  let adapters

  let port

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    adapters = createAdapters()

    port = adapters.port

    const container = createExodus({ adapters, config })

    exodus = container.resolve()
  })

  test('should emit availableAssetNamesByWalletAccount', async () => {
    const event = expectEvent({ port, event: 'availableAssetNamesByWalletAccount' })

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    await event

    await exodus.application.stop()
  })

  test('api', async () => {
    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    await expect(
      exodus.assetSources.isSupported({ assetName: 'bitcoin', walletAccount: 'exodus_0' })
    ).resolves.toEqual(true)

    await exodus.application.stop()
  })
})
