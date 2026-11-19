import type { Atom } from '@exodus/atoms'
import { createInMemoryAtom } from '@exodus/atoms'
import createInMemoryStorage from '@exodus/storage-memory'

import type { Analytics } from '../index.js'
import analyticsDefinition from '../index.js'

const { factory: createAnalytics } = analyticsDefinition

type FactoryArgs = Parameters<typeof createAnalytics>[0]

const defaultTrackerId = 'default-id'
const installEventReportingUrl = 'https://support-helpers.a.exodus.io/extension/installs'
const logger = { warn: jest.fn(), debug: jest.fn(), error: jest.fn() }

describe('Analytics module', () => {
  let analytics: Analytics
  let mockStorage: ReturnType<typeof createInMemoryStorage>
  let mockTracker: ReturnType<typeof createTracker>
  let mockShareActivityAtom: { get: jest.Mock }
  let mockAnalyticsUserIdAtom: Atom<string | undefined>
  let fetch: jest.Mock
  let mockPersistedAnalyticsEventsAtom: Atom<unknown[] | undefined>
  let mockPersistedAnalyticsTraitsAtom: Atom<unknown[] | undefined>

  const createTracker = () => {
    const defaultProperties: Record<string, unknown> = {}
    const tracker: {
      anonymousId: string
      userId: string | undefined
      getAnonymousId: () => string
      setUserId: jest.Mock
      setAnonymousId: jest.Mock
      defaultProperties: Record<string, unknown>
      setDefaultProperties: jest.Mock
      setDefaultPropertiesForSanitizationErrors: jest.Mock
      track: jest.Mock
      identify: jest.Mock
    } = {
      anonymousId: defaultTrackerId,
      userId: undefined,
      getAnonymousId: () => tracker.anonymousId,
      setUserId: jest.fn((id: string) => (tracker.userId = id)),
      setAnonymousId: jest.fn((id: string) => (tracker.anonymousId = id)),
      defaultProperties,
      setDefaultProperties: jest.fn((properties: Record<string, unknown>) =>
        Object.assign(defaultProperties, properties)
      ),
      setDefaultPropertiesForSanitizationErrors: jest.fn(),
      track: jest.fn(
        (event: Record<string, unknown> & { properties?: Record<string, unknown> }) => ({
          ...event,
          properties: { ...defaultProperties, ...event.properties },
        })
      ),
      identify: jest.fn(),
    }
    return tracker
  }

  beforeEach(() => {
    fetch = jest.fn(async () => ({ status: 200, json: async () => {} }))
    mockTracker = createTracker()
    mockShareActivityAtom = { get: jest.fn() }
    mockAnalyticsUserIdAtom = createInMemoryAtom<string>()
    mockStorage = createInMemoryStorage()
    mockPersistedAnalyticsEventsAtom = createInMemoryAtom({ defaultValue: [] as unknown[] })
    mockPersistedAnalyticsTraitsAtom = createInMemoryAtom({ defaultValue: [] as unknown[] })

    logger.warn.mockReset()
    logger.debug.mockReset()
    logger.error.mockReset()

    analytics = createAnalytics({
      fetch: fetch as unknown as FactoryArgs['fetch'],
      storage: mockStorage as unknown as FactoryArgs['storage'],
      analyticsTracker: mockTracker as unknown as FactoryArgs['analyticsTracker'],
      shareActivityAtom: mockShareActivityAtom as unknown as FactoryArgs['shareActivityAtom'],
      analyticsUserIdAtom: mockAnalyticsUserIdAtom as unknown as FactoryArgs['analyticsUserIdAtom'],
      persistedAnalyticsEventsAtom:
        mockPersistedAnalyticsEventsAtom as unknown as FactoryArgs['persistedAnalyticsEventsAtom'],
      persistedAnalyticsTraitsAtom:
        mockPersistedAnalyticsTraitsAtom as unknown as FactoryArgs['persistedAnalyticsTraitsAtom'],
      config: { installEventReportingUrl, flushTimeout: 100 },
      logger: logger as unknown as FactoryArgs['logger'],
    })
    mockShareActivityAtom.get.mockResolvedValueOnce(true)

    analytics.setAnonymousId('anonymousId')
  })

  describe('.flush()', () => {
    const event = { event: 'test event' }
    const traits = { traits: { trustScore: 0 } }

    it('flushes persisted events to server', async () => {
      await mockPersistedAnalyticsEventsAtom.set([{ ...event, persistId: 1 }])

      void mockAnalyticsUserIdAtom.set('userId')
      analytics.setUserId('userId')
      void analytics.flush()

      await new Promise((resolve) => setTimeout(resolve, 0)) // to wait for the async `track` function to complete

      expect(mockTracker.track).toHaveBeenCalledWith(event)

      await expect(mockPersistedAnalyticsEventsAtom.get()).resolves.toEqual([])
    })

    it('flushes persisted traits to server', async () => {
      await mockPersistedAnalyticsTraitsAtom.set([{ ...traits, persistId: 1 }])

      void mockAnalyticsUserIdAtom.set('userId')
      analytics.setUserId('userId')
      void analytics.flush()

      await new Promise((resolve) => setTimeout(resolve, 0)) // to wait for the async `track` function to complete

      expect(mockTracker.identify).toHaveBeenCalledWith(traits)

      await expect(mockPersistedAnalyticsTraitsAtom.get()).resolves.toEqual([])
    })

    it('sends postInstallEvent if the reporting URL is provided', async () => {
      await mockStorage.set('postInstallEvent', true)

      void mockAnalyticsUserIdAtom.set('userId')
      analytics.setUserId('userId')
      void analytics.flush()

      await new Promise((resolve) => setTimeout(resolve, 0)) // to wait for the async `track` function to complete

      expect(fetch).toHaveBeenCalledWith(
        new URL(installEventReportingUrl),
        expect.objectContaining({ body: JSON.stringify({ anonymousId: 'userId' }) })
      )

      await expect(mockStorage.get('postInstallEvent')).resolves.toEqual(undefined)
    })

    it('persists the event if no userId set', async () => {
      await analytics.track(event)

      expect(mockTracker.track).not.toHaveBeenCalledWith(event)

      await expect(mockPersistedAnalyticsEventsAtom.get()).resolves.toEqual([
        { ...event, persistId: expect.any(String), timestamp: expect.any(String) },
      ])
    })

    it('serializes concurrent flush calls so the backlog is sent once', async () => {
      await mockPersistedAnalyticsEventsAtom.set([{ ...event, persistId: 1 }])

      void mockAnalyticsUserIdAtom.set('userId')
      analytics.setUserId('userId')

      await Promise.all([analytics.flush(), analytics.flush(), analytics.flush()])

      expect(mockTracker.track).toHaveBeenCalledTimes(1)
      expect(mockTracker.track).toHaveBeenCalledWith(event)
    })

    it('runs a fresh flush after the previous one settled', async () => {
      void mockAnalyticsUserIdAtom.set('userId')
      analytics.setUserId('userId')

      await analytics.flush()

      await mockPersistedAnalyticsEventsAtom.set([{ ...event, persistId: 2 }])

      await analytics.flush()

      expect(mockTracker.track).toHaveBeenCalledWith(event)
    })
  })

  describe('.setDefaultEventProperties()', () => {
    it("calls the appropriate tracker's method", () => {
      const defaultProperties = { defaultTimestamp: new Date() }

      analytics.setDefaultEventProperties(defaultProperties)

      expect(mockTracker.setDefaultProperties).toHaveBeenCalledWith(defaultProperties)
    })
  })

  describe('.requireDefaultEventProperties()', () => {
    const event = { event: 'test event' }

    it('should start tracking events if required properties are present before flush', async () => {
      analytics.requireDefaultEventProperties(['os', 'build'])
      analytics.setDefaultEventProperties({ os: 'android', build: 'genesis' })

      await analytics.flush()
      await analytics.track(event)

      expect(mockTracker.track).toHaveBeenCalledWith(event)
    })

    it('should start tracking events if properties set after being declared required', async () => {
      analytics.setDefaultEventProperties({ os: 'android', build: 'genesis' })
      analytics.requireDefaultEventProperties(['os', 'build'])

      await analytics.flush()
      await analytics.track(event)

      expect(mockTracker.track).toHaveBeenCalledWith(event)
    })

    it('should start tracking events after all required properties are present', async () => {
      analytics.requireDefaultEventProperties(['os', 'build'])

      const flush = analytics.flush()

      await analytics.track(event)

      expect(mockTracker.track).not.toHaveBeenCalledWith(event)

      analytics.setDefaultEventProperties({ os: 'android', build: 'genesis' })

      await flush

      expect(mockTracker.track).toHaveBeenCalledWith({ ...event, timestamp: expect.any(String) })
    })

    describe('cross-format property handling (camelCase <-> snake_case)', () => {
      it('should resolve when properties are required in camelCase and set in snake_case', async () => {
        analytics.requireDefaultEventProperties(['hasBackup', 'stakedAssets'])

        await analytics.track(event)

        expect(mockTracker.track).not.toHaveBeenCalledWith(event)

        analytics.setDefaultEventProperties({ has_backup: true, staked_assets: ['BTC', 'ETH'] })

        await analytics.flush()

        expect(mockTracker.track).toHaveBeenCalledWith({ ...event, timestamp: expect.any(String) })
      })

      it('should resolve when properties are required in snake_case and set in camelCase', async () => {
        analytics.requireDefaultEventProperties(['has_backup', 'staked_assets'])

        await analytics.track(event)

        expect(mockTracker.track).not.toHaveBeenCalledWith(event)

        analytics.setDefaultEventProperties({ hasBackup: true, stakedAssets: ['BTC', 'ETH'] })

        await analytics.flush()

        expect(mockTracker.track).toHaveBeenCalledWith({ ...event, timestamp: expect.any(String) })
      })

      it('should handle mixed formats in both require and set calls', async () => {
        analytics.requireDefaultEventProperties([
          'hasBackup',
          'staked_assets',
          'isStaking',
          'account_source',
        ])

        await analytics.track(event)

        expect(mockTracker.track).not.toHaveBeenCalledWith(event)

        analytics.setDefaultEventProperties({
          has_backup: true,
          stakedAssets: ['BTC'],
          is_staking: true,
          accountSource: 'mobile',
        })

        await analytics.flush()

        expect(mockTracker.track).toHaveBeenCalledWith({ ...event, timestamp: expect.any(String) })
      })

      it('should handle properties set in multiple calls with different formats', async () => {
        analytics.requireDefaultEventProperties(['hasBackup', 'stakedAssets', 'totalBalanceUsd'])

        await analytics.track(event)

        expect(mockTracker.track).not.toHaveBeenCalledWith(event)

        analytics.setDefaultEventProperties({ has_backup: true })

        analytics.setDefaultEventProperties({ stakedAssets: ['BTC'] })

        analytics.setDefaultEventProperties({ total_balance_usd: 1000 })

        await analytics.flush()

        expect(mockTracker.track).toHaveBeenCalledWith({ ...event, timestamp: expect.any(String) })
      })

      it('should not create duplicate promises for alternate format', async () => {
        analytics.requireDefaultEventProperties(['hasBackup'])
        analytics.requireDefaultEventProperties(['has_backup'])

        await analytics.track(event)

        expect(mockTracker.track).not.toHaveBeenCalledWith(event)

        analytics.setDefaultEventProperties({ has_backup: true })

        await analytics.flush()

        expect(mockTracker.track).toHaveBeenCalledWith({ ...event, timestamp: expect.any(String) })
      })

      it('should recognize already set properties in alternate format', async () => {
        analytics.setDefaultEventProperties({ has_backup: true, staked_assets: [] })

        analytics.requireDefaultEventProperties(['hasBackup', 'stakedAssets'])

        await analytics.flush()
        await analytics.track(event)

        expect(mockTracker.track).toHaveBeenCalledWith(event)
      })

      it('should handle properties that do not need conversion', async () => {
        analytics.requireDefaultEventProperties(['os', 'build', 'version'])

        await analytics.track(event)

        expect(mockTracker.track).not.toHaveBeenCalledWith(event)

        analytics.setDefaultEventProperties({ os: 'android', build: 'genesis', version: '1.0.0' })

        await analytics.flush()

        expect(mockTracker.track).toHaveBeenCalledWith({ ...event, timestamp: expect.any(String) })
      })
    })
  })

  describe('circuit breaker / timeout behavior', () => {
    const event = { event: 'test event' }

    it('should timeout and continue if required properties are never set', async () => {
      analytics.requireDefaultEventProperties(['missingProperty'])

      await analytics.flush()

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Analytics flush timeout'),
        expect.objectContaining({
          pendingProperties: ['missing_property'],
          timeoutMs: 100,
        })
      )

      // Analytics should still work after timeout
      await analytics.track(event)
      expect(mockTracker.track).toHaveBeenCalledWith(event)
    })

    it('should not timeout if all properties are set before timeout', async () => {
      analytics.requireDefaultEventProperties(['hasBackup'])
      analytics.setDefaultEventProperties({ has_backup: true })

      await analytics.flush()

      expect(logger.error).not.toHaveBeenCalledWith(
        expect.stringContaining('Analytics flush timeout'),
        expect.anything()
      )

      await analytics.track(event)
      expect(mockTracker.track).toHaveBeenCalledWith(event)
    })

    it('should log only the properties that are still pending', async () => {
      analytics.requireDefaultEventProperties(['hasBackup', 'missingProperty1', 'missingProperty2'])

      analytics.setDefaultEventProperties({ has_backup: true })

      await analytics.flush()

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Analytics flush timeout'),
        {
          pendingProperties: ['missing_property_1', 'missing_property_2'],
          timeoutMs: 100,
        }
      )
    })

    it('should handle cross-format property names in timeout logging', async () => {
      analytics.requireDefaultEventProperties(['hasBackup', 'stakedAssets'])

      await analytics.flush()

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Analytics flush timeout'),
        expect.objectContaining({
          pendingProperties: expect.arrayContaining(['has_backup', 'staked_assets']),
        })
      )
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
      } as unknown as FactoryArgs)

      try {
        await analytics.trackInstall()
      } catch (err) {
        expect(
          (err as Error).message.includes(
            'installEventReportingUrl was not provided to the constructor'
          )
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

      expect(mockTracker.track).toHaveBeenCalledWith(event)
    })

    it('does not track the event if sharing activity is disabled', async () => {
      mockShareActivityAtom.get.mockReset().mockResolvedValueOnce(false)

      analytics.setUserId('userId')

      await analytics.flush()
      await analytics.track(event)

      expect(mockTracker.track).not.toHaveBeenCalledWith(event)

      await expect(mockPersistedAnalyticsEventsAtom.get()).resolves.toEqual([])
    })

    it('tracks the event if `force` flag is true', async () => {
      mockShareActivityAtom.get.mockReset().mockResolvedValueOnce(false)

      analytics.setUserId('userId')

      await analytics.flush()
      await analytics.track({ ...event, force: true })

      expect(mockTracker.track).toHaveBeenCalledWith(event)
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
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(mockTracker.track).toHaveBeenCalledWith(eventWithTimestamp)
    })
  })

  describe('persisted backlog flush', () => {
    const makeEvents = (count: number) =>
      Array.from({ length: count }, (_, i) => ({ event: `event ${i}`, persistId: `p${i}` }))

    beforeEach(() => {
      mockShareActivityAtom.get.mockReset().mockResolvedValue(true)
      analytics.setUserId('userId')
    })

    it('sends all persisted events in chunks and clears the backlog', async () => {
      await mockPersistedAnalyticsEventsAtom.set(makeEvents(25))

      await analytics.flush()

      expect(mockTracker.track).toHaveBeenCalledTimes(25)
      await expect(mockPersistedAnalyticsEventsAtom.get()).resolves.toEqual([])
    })

    it('clears sent entries incrementally per chunk, not only after the full flush', async () => {
      await mockPersistedAnalyticsEventsAtom.set(makeEvents(25))

      let calls = 0
      mockTracker.track.mockImplementation(() => {
        calls += 1
        // Block the second chunk forever to simulate an interrupted flush
        return calls > 10 ? new Promise(() => {}) : undefined
      })

      void analytics.flush()
      await new Promise((resolve) => setTimeout(resolve, 0))

      const remaining = await mockPersistedAnalyticsEventsAtom.get()
      expect(remaining).toHaveLength(15)
    })

    it('keeps failed sends queued for retry without blocking the rest', async () => {
      await mockPersistedAnalyticsEventsAtom.set(makeEvents(5))

      mockTracker.track.mockRejectedValueOnce(new Error('network down'))

      await analytics.flush()

      expect(mockTracker.track).toHaveBeenCalledTimes(5)

      const remaining = (await mockPersistedAnalyticsEventsAtom.get()) as { persistId: string }[]
      expect(remaining).toEqual([expect.objectContaining({ persistId: 'p0' })])
    })

    it('drops entries beyond the cap before sending', async () => {
      await mockPersistedAnalyticsEventsAtom.set(makeEvents(250))

      await analytics.flush()

      expect(mockTracker.track).toHaveBeenCalledTimes(200)
      await expect(mockPersistedAnalyticsEventsAtom.get()).resolves.toEqual([])
    })

    it('keeps an entry persisted mid-flush when trimming an over-cap backlog', async () => {
      await mockPersistedAnalyticsEventsAtom.set(makeEvents(250))

      const flushPromise = analytics.flush()
      void mockPersistedAnalyticsEventsAtom.set((prev) => [
        ...(prev ?? []),
        { event: 'inflight', persistId: 'late' },
      ])
      await flushPromise

      const remaining = (await mockPersistedAnalyticsEventsAtom.get()) as { persistId: string }[]
      expect(remaining.map(({ persistId }) => persistId)).toEqual(['late'])
    })

    it('caps the stored events backlog at write time', async () => {
      await mockPersistedAnalyticsEventsAtom.set(makeEvents(200))

      await analytics.track({ event: 'newest' })

      const stored = (await mockPersistedAnalyticsEventsAtom.get()) as { event: string }[]
      expect(stored).toHaveLength(200)
      expect(stored[0]?.event).toBe('event 1')
      expect(stored[stored.length - 1]?.event).toBe('newest')
    })

    it('does not queue identical traits twice', async () => {
      const args = { traits: { notificationsEnabled: false } }

      await analytics.setUserTraits(args)
      await analytics.setUserTraits(args)
      await analytics.setUserTraits({ traits: { notificationsEnabled: true } })

      const stored = await mockPersistedAnalyticsTraitsAtom.get()
      expect(stored).toHaveLength(2)
    })

    it('moves a re-asserted trait payload to the end of the queue (last-write-wins)', async () => {
      await analytics.setUserTraits({ traits: { notificationsEnabled: false } })
      await analytics.setUserTraits({ traits: { notificationsEnabled: true } })
      await analytics.setUserTraits({ traits: { notificationsEnabled: false } })

      const stored = (await mockPersistedAnalyticsTraitsAtom.get()) as {
        traits: Record<string, unknown>
      }[]
      expect(stored.map(({ traits }) => traits)).toEqual([
        { notificationsEnabled: true },
        { notificationsEnabled: false },
      ])
    })

    it('replays queued traits sequentially in queue order', async () => {
      const calls: string[] = []
      mockTracker.identify.mockImplementation(async ({ traits }: { traits: { step: number } }) => {
        calls.push(`start:${traits.step}`)
        await new Promise((resolve) => setTimeout(resolve, traits.step === 1 ? 20 : 0))
        calls.push(`end:${traits.step}`)
      })

      await analytics.setUserTraits({ traits: { step: 1 } })
      await analytics.setUserTraits({ traits: { step: 2 } })

      await analytics.flush()

      expect(calls).toEqual(['start:1', 'end:1', 'start:2', 'end:2'])
    })

    it('stops trait replay at the first failed send to preserve ordering across retries', async () => {
      mockTracker.identify.mockImplementation(async ({ traits }: { traits: { step: number } }) => {
        if (traits.step === 2) throw new Error('network down')
      })

      await analytics.setUserTraits({ traits: { step: 1 } })
      await analytics.setUserTraits({ traits: { step: 2 } })
      await analytics.setUserTraits({ traits: { step: 3 } })

      await analytics.flush()

      expect(mockTracker.identify).toHaveBeenCalledTimes(2)

      const remaining = (await mockPersistedAnalyticsTraitsAtom.get()) as {
        traits: { step: number }
      }[]
      expect(remaining.map(({ traits }) => traits.step)).toEqual([2, 3])
    })

    it('persists concurrently tracked events without losing entries', async () => {
      await Promise.all([
        analytics.track({ event: 'a' }),
        analytics.track({ event: 'b' }),
        analytics.track({ event: 'c' }),
      ])

      await expect(mockPersistedAnalyticsEventsAtom.get()).resolves.toHaveLength(3)
    })

    it('persists concurrently set traits without losing entries', async () => {
      await Promise.all([
        analytics.setUserTraits({ traits: { a: 1 } }),
        analytics.setUserTraits({ traits: { b: 2 } }),
        analytics.setUserTraits({ traits: { c: 3 } }),
      ])

      await expect(mockPersistedAnalyticsTraitsAtom.get()).resolves.toHaveLength(3)
    })
  })

  describe('.setUserTraits()', () => {
    const args = { traits: { testTrait: true } }

    it('calls the tracker"s "setUserTraits" method if connected and sharing activity is enabled', async () => {
      analytics.setUserId('userId')

      await analytics.flush()
      await analytics.setUserTraits(args)

      expect(mockTracker.identify).toHaveBeenCalledWith(args)
    })

    it('does not call the tracker"s "setUserTraits" method if connected and sharing activity is disabled', async () => {
      mockShareActivityAtom.get.mockReset().mockResolvedValueOnce(false)

      analytics.setUserId('userId')

      await analytics.setUserTraits(args)

      expect(mockTracker.identify).not.toHaveBeenCalledWith()
    })

    it('calls the tracker"s "setUserTraits" method if connected and sharing activity is disabled and `force` flag is true', async () => {
      mockShareActivityAtom.get.mockReset().mockResolvedValueOnce(false)

      analytics.setUserId('userId')

      await analytics.flush()
      await analytics.setUserTraits({ ...args, force: true })

      expect(mockTracker.identify).toHaveBeenCalledWith(args)
    })
  })
})
