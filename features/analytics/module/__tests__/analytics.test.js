import { createInMemoryAtom } from '@exodus/atoms'
import createInMemoryStorage from '@exodus/storage-memory'

import analyticsDefinition from '..'

const { factory: createAnalytics } = analyticsDefinition

const defaultTrackerId = 'default-id'
const installEventReportingUrl = 'https://support-helpers.a.exodus.io/extension/installs'
const logger = { warn: jest.fn(), debug: jest.fn() }

describe('Analytics module', () => {
  let analytics,
    mockStorage,
    mockTracker,
    mockShareActivityAtom,
    mockAnalyticsUserIdAtom,
    fetch,
    mockPersistedAnalyticsEventsAtom,
    mockPersistedAnalyticsTraitsAtom

  const createTracker = () => {
    const defaultProperties = {}

    return {
      anonymousId: defaultTrackerId,
      getAnonymousId: () => mockTracker.anonymousId,
      setUserId: jest.fn((id) => (mockTracker.userId = id)),
      setAnonymousId: jest.fn((id) => (mockTracker.anonymousId = id)),
      defaultProperties,
      setDefaultProperties: jest.fn((properties) => Object.assign(defaultProperties, properties)),
      track: jest.fn((event) => ({
        ...event,
        properties: { ...defaultProperties, ...event.properties },
      })),
      identify: jest.fn(),
    }
  }

  beforeEach(() => {
    fetch = jest.fn(async () => ({ status: 200, json: async () => {} }))
    mockTracker = createTracker()
    mockShareActivityAtom = { get: jest.fn() }
    mockAnalyticsUserIdAtom = createInMemoryAtom()
    mockStorage = createInMemoryStorage()
    mockPersistedAnalyticsEventsAtom = createInMemoryAtom({ defaultValue: [] })
    mockPersistedAnalyticsTraitsAtom = createInMemoryAtom({ defaultValue: [] })

    analytics = createAnalytics({
      fetch,
      storage: mockStorage,
      analyticsTracker: mockTracker,
      shareActivityAtom: mockShareActivityAtom,
      analyticsUserIdAtom: mockAnalyticsUserIdAtom,
      persistedAnalyticsEventsAtom: mockPersistedAnalyticsEventsAtom,
      persistedAnalyticsTraitsAtom: mockPersistedAnalyticsTraitsAtom,
      config: { installEventReportingUrl },
      logger,
    })
    mockShareActivityAtom.get.mockResolvedValueOnce(true)

    analytics.setAnonymousId('anonymousId')
  })

  describe('.flush()', () => {
    const event = { event: 'test event' }
    const traits = { traits: { trustScore: 0 } }

    it('flushes persisted events to server', async () => {
      await mockPersistedAnalyticsEventsAtom.set([{ ...event, persistId: 1 }])

      mockAnalyticsUserIdAtom.set('userId')
      analytics.setUserId('userId')
      analytics.flush()

      await new Promise(process.nextTick) // to wait for the async `track` function to complete

      expect(mockTracker.track).toBeCalledWith(event)

      await expect(mockPersistedAnalyticsEventsAtom.get()).resolves.toEqual([])
    })

    it('flushes persisted traits to server', async () => {
      await mockPersistedAnalyticsTraitsAtom.set([{ ...traits, persistId: 1 }])

      mockAnalyticsUserIdAtom.set('userId')
      analytics.setUserId('userId')
      analytics.flush()

      await new Promise(process.nextTick) // to wait for the async `track` function to complete

      expect(mockTracker.identify).toBeCalledWith(traits)

      await expect(mockPersistedAnalyticsTraitsAtom.get()).resolves.toEqual([])
    })

    it('sends postInstallEvent if the reporting URL is provided', async () => {
      await mockStorage.set('postInstallEvent', true)

      mockAnalyticsUserIdAtom.set('userId')
      analytics.setUserId('userId')
      analytics.flush()

      await new Promise(process.nextTick) // to wait for the async `track` function to complete

      expect(fetch).toHaveBeenCalledWith(
        new URL(installEventReportingUrl),
        expect.objectContaining({ body: JSON.stringify({ anonymousId: 'userId' }) })
      )

      await expect(mockStorage.get('postInstallEvent')).resolves.toEqual(undefined)
    })

    it('persists the event if no userId set', async () => {
      await analytics.track(event)

      expect(mockTracker.track).not.toBeCalledWith(event)

      await expect(mockPersistedAnalyticsEventsAtom.get()).resolves.toEqual([
        { ...event, persistId: expect.any(String), timestamp: expect.any(String) },
      ])
    })
  })

  describe('.setDefaultEventProperties()', () => {
    it("calls the appropriate tracker's method", () => {
      const defaultProperties = { defaultTimestamp: new Date() }

      analytics.setDefaultEventProperties(defaultProperties)

      expect(mockTracker.setDefaultProperties).toBeCalledWith(defaultProperties)
    })
  })

  describe('.requireDefaultEventProperties()', () => {
    const event = { event: 'test event' }

    it('should start tracking events if required properties are present before flush', async () => {
      analytics.requireDefaultEventProperties(['os', 'build'])
      analytics.setDefaultEventProperties({ os: 'android', build: 'genesis' })

      await analytics.flush()
      await analytics.track(event)

      expect(mockTracker.track).toBeCalledWith(event)
    })

    it('should start tracking events if properties set after being declared required', async () => {
      analytics.setDefaultEventProperties({ os: 'android', build: 'genesis' })
      analytics.requireDefaultEventProperties(['os', 'build'])

      await analytics.flush()
      await analytics.track(event)

      expect(mockTracker.track).toBeCalledWith(event)
    })

    it('should start tracking events after all required properties are present', async () => {
      analytics.requireDefaultEventProperties(['os', 'build'])

      const flush = analytics.flush()

      await analytics.track(event)

      expect(mockTracker.track).not.toBeCalledWith(event)

      analytics.setDefaultEventProperties({ os: 'android', build: 'genesis' })

      await flush

      expect(mockTracker.track).toBeCalledWith({ ...event, timestamp: expect.any(String) })
    })
  })

  describe('.trackInstall()', () => {
    it('sets a `true` flag in the storage', async () => {
      await analytics.trackInstall()

      await expect(mockStorage.get('postInstallEvent')).resolves.toEqual(true)
    })

    it('fails if the reporting URL was not provided', async () => {
      const analytics = createAnalytics({
        storage: mockStorage,
        tracker: mockTracker,
        shareActivityAtom: mockShareActivityAtom,
        config: {},
        logger,
      })

      try {
        await analytics.trackInstall()
      } catch (err) {
        expect(
          err.message.includes('installEventReportingUrl was not provided to the constructor')
        ).toBeTruthy()
      }

      await expect(mockStorage.get('postInstallEvent')).resolves.toEqual(undefined)
    })
  })

  describe('.track()', () => {
    const event = { event: 'test event' }

    it('tracks to server after events have been flushed', async () => {
      analytics.setUserId('userId')

      await analytics.flush()
      await analytics.track(event)

      expect(mockTracker.track).toBeCalledWith(event)
    })

    it('does not track the event if sharing activity is disabled', async () => {
      mockShareActivityAtom.get.mockReset().mockResolvedValueOnce(false)

      analytics.setUserId('userId')

      await analytics.flush()
      await analytics.track(event)

      expect(mockTracker.track).not.toBeCalledWith(event)

      await expect(mockPersistedAnalyticsEventsAtom.get()).resolves.toEqual([])
    })

    it('tracks the event if `force` flag is true', async () => {
      mockShareActivityAtom.get.mockReset().mockResolvedValueOnce(false)

      analytics.setUserId('userId')

      await analytics.flush()
      await analytics.track({ ...event, force: true })

      expect(mockTracker.track).toBeCalledWith(event)
    })
  })

  describe('integration tests for track', () => {
    const event = { event: 'test event' }
    const eventWithTimestamp = { ...event, timestamp: expect.any(String) }

    it('tracks until flush is called', async () => {
      analytics.setUserId('userId')

      await analytics.track(event)

      expect(mockTracker.track).not.toBeCalled()

      await analytics.flush()
      await new Promise(process.nextTick)

      expect(mockTracker.track).toBeCalledWith(eventWithTimestamp)
    })
  })

  describe('.setUserTraits()', () => {
    const args = { traits: { testTrait: true } }

    it('calls the tracker"s "setUserTraits" method if connected and sharing activity is enabled', async () => {
      analytics.setUserId('userId')

      await analytics.flush()
      await analytics.setUserTraits(args)

      expect(mockTracker.identify).toBeCalledWith(args)
    })

    it('does not call the tracker"s "setUserTraits" method if connected and sharing activity is disabled', async () => {
      mockShareActivityAtom.get.mockReset().mockResolvedValueOnce(false)

      analytics.setUserId('userId')

      await analytics.setUserTraits(args)

      expect(mockTracker.identify).not.toBeCalledWith()
    })

    it('calls the tracker"s "setUserTraits" method if connected and sharing activity is disabled and `force` flag is true', async () => {
      mockShareActivityAtom.get.mockReset().mockResolvedValueOnce(false)

      analytics.setUserId('userId')

      await analytics.flush()
      await analytics.setUserTraits({ ...args, force: true })

      expect(mockTracker.identify).toBeCalledWith(args)
    })
  })
})
