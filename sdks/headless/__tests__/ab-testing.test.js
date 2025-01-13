import abTesting from '@exodus/ab-testing'

import createAdapters from './adapters'
import _config from './config'
import createExodus from './exodus'
import expectEvent from './expect-event'

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

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    adapters = createAdapters()

    port = adapters.port

    const container = createExodus({ adapters, config })

    container.use(abTesting())

    exodus = container.resolve()
  })

  test('should emit ab-testing value', async () => {
    const currencyEvent = expectEvent({ port, event: 'abTesting' })

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    await currencyEvent
  })
})
