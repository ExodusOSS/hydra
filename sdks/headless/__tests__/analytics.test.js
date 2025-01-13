import {
  analyticsUserIdAtomDefinition,
  persistedAnalyticsEventsAtomDefinition,
  persistedAnalyticsTraitsAtomDefinition,
  shareActivityAtomDefinition,
} from '@exodus/analytics/atoms'
import analyticsModule from '@exodus/analytics/module'
import { EXODUS_KEY_IDS } from '@exodus/key-ids'

import createAdapters from './adapters'
import _config from './config'
import createExodus from './exodus'

const config = {
  ..._config,
  // tmp: remove after analytics supports a default config at the feature level
  analytics: {},
  analyticsUserIdAtom: {
    keychainIdentifier: EXODUS_KEY_IDS.TELEMETRY,
  },
}

describe('analytics', () => {
  let exodus
  let adapters
  let analyticsTracker

  beforeEach(async () => {
    adapters = createAdapters()

    analyticsTracker = {
      track: jest.fn(),
      getAnonymousId: jest.fn(),
      setAnonymousId: jest.fn(),
      setDefaultProperties: jest.fn(),
      setDefaultPropertiesForSanitizationErrors: jest.fn(),
      defaultProperties: {},
    }

    const container = createExodus({ adapters, config })

    container.register({ definition: analyticsModule })
    container.register({ definition: shareActivityAtomDefinition })
    container.register({ definition: analyticsUserIdAtomDefinition })
    container.register({ definition: persistedAnalyticsEventsAtomDefinition })
    container.register({ definition: persistedAnalyticsTraitsAtomDefinition })

    container.register({
      definition: {
        id: 'analyticsTracker',
        type: 'module',
        factory: () => analyticsTracker,
        public: true,
      },
    })

    exodus = container.resolve()
  })

  test('should set env properties properties on start', async () => {
    await exodus.application.start()

    expect(analyticsTracker.setDefaultProperties).toHaveBeenCalledWith({
      appBuild: 'prod',
      appPlatform: 'mobile',
      appVersion: '1.0.0',
    })
  })

  test('should set build metadata properties on start', async () => {
    await exodus.application.start()

    expect(analyticsTracker.setDefaultProperties).toHaveBeenCalledWith({
      appId: 'exodus',
      osName: 'android',
      deviceMode: undefined,
    })
  })
})

describe('analytics not registered', () => {
  let exodus

  beforeEach(() => {
    const container = createExodus({ adapters: createAdapters(), config })
    exodus = container.resolve()
  })

  test('does not throw on unlock', async () => {
    await exodus.application.start()
    await exodus.application.create()
    await expect(exodus.application.unlock()).resolves.not.toThrow()
  })
})
