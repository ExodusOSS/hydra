import analytics from '@exodus/analytics'
import {
  analyticsUserIdAtomDefinition,
  persistedAnalyticsEventsAtomDefinition,
  persistedAnalyticsTraitsAtomDefinition,
  shareActivityAtomDefinition,
} from '@exodus/analytics/atoms'
import analyticsModule from '@exodus/analytics/module'

import createAdapters from './adapters'
import _config from './config'
import createExodus from './exodus'

const config = {
  ..._config,
  analyticsUserIdAtom: {},
}

const createTrackerMock = () => ({
  track: jest.fn(),
  identify: jest.fn(),
  setAnonymousId: jest.fn(),
  getAnonymousId: jest.fn(),
  setUserId: jest.fn(),
  setDefaultProperties: jest.fn(),
  setDefaultPropertiesForSanitizationErrors: jest.fn(),
  defaultProperties: {},
})

describe('analytics', () => {
  let exodus
  let adapters
  let analyticsTracker

  beforeEach(async () => {
    adapters = createAdapters()
    analyticsTracker = createTrackerMock()
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

describe('reporting', () => {
  let exodus
  let adapters
  let analyticsTracker

  beforeEach(async () => {
    adapters = createAdapters()
    analyticsTracker = createTrackerMock()

    const container = createExodus({ adapters, config })
    container.use(analytics(config.analytics))
    container.register({
      definition: {
        id: 'validateAnalyticsEvent',
        factory: () => () => true,
      },
    })

    container.register({
      definition: {
        override: true,
        id: 'analyticsTracker',
        type: 'module',
        factory: () => analyticsTracker,
        public: true,
      },
    })

    exodus = container.resolve()
  })

  test('report pre-wallet-exists', async () => {
    await exodus.application.start()
    await exodus.application.load()
    await expect(exodus.wallet.exists()).resolves.toEqual(false)
    await expect(exodus.reporting.export()).resolves.toEqual(
      expect.objectContaining({
        analytics: {
          userId: null,
        },
      })
    )
  })

  test('report post-wallet-exists', async () => {
    await exodus.application.start()
    await exodus.application.create()
    await exodus.application.unlock()
    await expect(exodus.wallet.exists()).resolves.toEqual(true)
    await expect(exodus.reporting.export()).resolves.toEqual(
      expect.objectContaining({
        analytics: {
          userId: expect.any(String),
        },
      })
    )
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
