import createAdapters from './adapters/index.js'
import _config from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'
import { createMockRemoteConfig } from './utils/remote-config.js'

const featureFlagsConfig = {
  dogeMode: {
    localDefaults: {
      available: true,
      enabled: true,
    },
    remoteConfig: {
      path: 'dapps.doge',
      supportedOverrides: {
        enabled: true,
        geolocation: true,
        shutdownSemver: true,
      },
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

describe('feature-flags', () => {
  let container

  let adapters

  let port

  const passphrase = 'my-password-manager-generated-this'

  let mockConfig
  beforeEach(async () => {
    adapters = createAdapters()

    port = adapters.port

    container = createExodus({ adapters, config })
    ;({ mockConfig } = createMockRemoteConfig({ container }))
  })

  test('should emit feature flags event on start', async () => {
    const expectFeatureFlags = expectEvent({ port, event: 'featureFlags' })

    const exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })

    const featureFlags = await expectFeatureFlags

    expect(featureFlags).toEqual({ dogeMode: { isOn: true } })

    await exodus.application.stop()
  })

  test('should disable feature via remote config', async () => {
    const exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.load()

    mockConfig({ dapps: { doge: { enabled: false } } })
    const featureFlagsEvent = expectEvent({ port, event: 'featureFlags' })

    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    await expect(featureFlagsEvent).resolves.toEqual({
      dogeMode: { isOn: false, unavailableReason: 'enabledOverride' },
    })

    await exodus.application.stop()
  })
})
