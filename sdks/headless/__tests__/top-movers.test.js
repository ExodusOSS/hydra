import topMovers from '@exodus/top-movers-monitor'

import createAdapters from './adapters'
import _config from './config'
import createExodus from './exodus'
import expectEvent from './expect-event'

const featureFlagsConfig = {
  topMovers: {
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
  topMoversMonitor: {
    computeLocally: true,
    minChangePercent: 1,
    fetchInterval: 1000,
  },
}

describe('top-movers', () => {
  let exodus

  let adapters

  let port

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    adapters = createAdapters()

    port = adapters.port

    const container = createExodus({ adapters, config })

    container.use(topMovers({ config: config.topMoversMonitor }))

    exodus = container.resolve()
  })

  test('should load top movers data when enabled', async () => {
    const eventPromise = expectEvent({ port, event: 'topMovers' })
    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    await eventPromise
  })
})
