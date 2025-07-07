import cryptoNews from '@exodus/crypto-news-monitor'

import createAdapters from './adapters/index.js'
import _config from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'

const featureFlagsConfig = {
  cryptoNews: {
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

describe('crypto-news', () => {
  let exodus

  let adapters

  let port

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    adapters = createAdapters()

    port = adapters.port

    const container = createExodus({ adapters, config })

    container.use(cryptoNews())

    exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })
  })

  afterEach(() => exodus.application.stop())

  test('should load news data when enabled', async () => {
    await expectEvent({ port, event: 'cryptoNews' })
  })
})
