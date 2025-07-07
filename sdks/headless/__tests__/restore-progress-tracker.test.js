import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'

describe('restoreProgressTracker', () => {
  let exodus
  let reportNode

  const passphrase = 'exceptionally-complex-secret'

  const setup = async ({ createWallet = true } = {}) => {
    const adapters = createAdapters()
    const port = adapters.port
    const container = createExodus({ adapters, config, port })

    exodus = container.resolve()
    reportNode = container.getByType('report').restoringAssetsReport

    await exodus.application.start()
    await exodus.application.load()
    if (createWallet) {
      await exodus.application.create({ passphrase })
      await exodus.application.unlock({ passphrase })
    }
  }

  beforeEach(setup)
  afterEach(() => exodus.application.stop())

  it('report passes schema validation (pre-wallet-exists)', async () => {
    await exodus.application.stop() // stop the instance from beforeEach
    await setup({ createWallet: false })

    const assetName = 'bitcoin'
    exodus.restoreProgressTracker.restoreAsset(assetName)

    await expect(exodus.wallet.exists()).resolves.toBe(false)

    const report = await reportNode.export({ walletExists: await exodus.wallet.exists() })
    await expect(exodus.reporting.export()).resolves.toMatchObject({
      restoringAssets: report,
    })
    expect(report).toEqual(null)
  })

  it('report passes schema validation (post-wallet-exists)', async () => {
    const assetName = 'bitcoin'
    exodus.restoreProgressTracker.restoreAsset(assetName)

    await expect(exodus.wallet.exists()).resolves.toBe(true)

    const report = await reportNode.export({ walletExists: await exodus.wallet.exists() })
    await expect(exodus.reporting.export()).resolves.toMatchObject({
      restoringAssets: report,
    })
    expect(report).toEqual({ data: expect.arrayContaining([assetName]) })
  })
})
