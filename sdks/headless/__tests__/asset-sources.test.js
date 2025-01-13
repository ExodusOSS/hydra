import createAdapters from './adapters'
import config from './config'
import createExodus from './exodus'
import expectEvent from './expect-event'

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
  })

  test('api', async () => {
    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    await expect(
      exodus.assetSources.isSupported({ assetName: 'bitcoin', walletAccount: 'exodus_0' })
    ).resolves.toEqual(true)
  })
})
