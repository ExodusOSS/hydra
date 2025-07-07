import abTesting from '@exodus/ab-testing'

import createAdapters from './adapters/index.js'
import _config from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'

const featureFlagsConfig = {
  abTesting: {
    localDefaults: {
      available: true,
      enabled: true,
    },
  },
}

const config = {
  ..._config,
  remoteConfigFeatureFlagAtoms: {
    features: featureFlagsConfig,
  },
  featureFlagAtoms: {
    features: featureFlagsConfig,
  },
  featureFlags: {
    features: featureFlagsConfig,
  },
}

describe('ab-testing', () => {
  let exodus

  let adapters

  let port

  let reportNode

  const passphrase = 'my-password-manager-generated-this'

  const setup = async ({ createWallet = true } = {}) => {
    await exodus.application.start()
    await exodus.application.load()
    if (createWallet) {
      await exodus.application.create({ passphrase })
      await exodus.application.unlock({ passphrase })
    }
  }

  beforeEach(async () => {
    adapters = createAdapters()

    port = adapters.port

    const container = createExodus({ adapters, config })

    container.use(abTesting())

    exodus = container.resolve()

    reportNode = container.get('abTestingReport')
  })

  test('should emit ab-testing value', async () => {
    const currencyEvent = expectEvent({ port, event: 'abTesting' })

    await setup()

    await currencyEvent

    await exodus.application.stop()
  })

  test('should successfully export report (pre-wallet-exists)', async () => {
    await setup({ createWallet: false })

    await expect(exodus.wallet.exists()).resolves.toBe(false)
    await expect(exodus.reporting.export()).resolves.toMatchObject({
      abTesting: await reportNode.export({ walletExists: await exodus.wallet.exists() }),
    })

    await exodus.application.stop()
  })

  test('should successfully export report (post-wallet-exists)', async () => {
    await setup()

    await expect(exodus.wallet.exists()).resolves.toBe(true)
    await expect(exodus.reporting.export()).resolves.toMatchObject({
      abTesting: await reportNode.export({ walletExists: await exodus.wallet.exists() }),
    })

    await exodus.application.stop()
  })
})
