import cryptoNews from '@exodus/crypto-news-monitor'

import createAdapters from './adapters'
import _config from './config'
import createExodus from './exodus'
import expectEvent from './expect-event'

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

  test('should load news data when enabled', async () => {
    await expectEvent({ port, event: 'cryptoNews' })
  })
})
