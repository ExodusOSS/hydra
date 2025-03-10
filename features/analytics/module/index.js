import createFetchival from '@exodus/fetch/experimental/create-fetchival'
import makeConcurrent from 'make-concurrent'
import pDefer from 'p-defer'
import { memoize } from '@exodus/basic-utils'

class Analytics {
  #logger
  #fetchival
  #storage
  #tracker
  #shareActivityAtom
  #analyticsUserIdAtom
  #persistedAnalyticsEventsAtom
  #persistedAnalyticsTraitsAtom
  #installEventReportingUrl
  #propertiesPromises = Object.create(null)
  #isTrackReady = false
  #persistIdCounter = 0 // identifier for persisted events and traits

  constructor({
    fetch,
    storage,
    shareActivityAtom,
    analyticsUserIdAtom,
    persistedAnalyticsEventsAtom,
    persistedAnalyticsTraitsAtom,
    analyticsTracker,
    logger,
    config: { installEventReportingUrl } = {},
  }) {
    this.#logger = logger
    this.#storage = storage
    this.#fetchival = createFetchival({ fetch })
    this.#shareActivityAtom = shareActivityAtom
    this.#analyticsUserIdAtom = analyticsUserIdAtom
    this.#persistedAnalyticsEventsAtom = persistedAnalyticsEventsAtom
    this.#persistedAnalyticsTraitsAtom = persistedAnalyticsTraitsAtom
    this.#tracker = analyticsTracker
    this.#persistEvent = makeConcurrent(this.#persistEvent, { concurrency: 1 })
    this.#installEventReportingUrl = installEventReportingUrl // optional
      ? new URL(installEventReportingUrl)
      : undefined
  }

  flush = async () => {
    const propertiesPromises = Object.values(this.#propertiesPromises).map((defer) => defer.promise)

    await Promise.all(propertiesPromises)

    this.#isTrackReady = true

    await Promise.all([
      this.#sendPersistedEvents(),
      this.#sendPersistedTraits(),
      this.#checkPostInstallEvent(),
    ])
  }

  #checkPostInstallEvent = async () => {
    if (!this.#installEventReportingUrl) return

    const postInstallEvent = await this.#storage.get('postInstallEvent')

    if (postInstallEvent) {
      try {
        const userId = await this.#analyticsUserIdAtom.get()
        await this.#fetchival(this.#installEventReportingUrl).post({ anonymousId: userId })
        await this.#storage.delete('postInstallEvent')
      } catch (error) {
        this.#logger.warn('sending install event failed', error)
      }
    }
  }

  #sendPersistedEvents = async () => {
    const persistedEvents = (await this.#persistedAnalyticsEventsAtom.get()) || []
    if (persistedEvents.length === 0) return

    await Promise.all(
      persistedEvents.map((event) => {
        const { persistId, ...eventWithoutPersistId } = event
        return this.#track(eventWithoutPersistId)
      })
    )
    await this.#persistedAnalyticsEventsAtom.set((prev) => {
      const prevEvents = prev ?? []
      return prevEvents.filter(
        ({ persistId }) => !persistedEvents.some((sentEvent) => sentEvent.persistId === persistId)
      )
    })
  }

  #sendPersistedTraits = async () => {
    const persistedTraits = (await this.#persistedAnalyticsTraitsAtom.get()) || []

    if (persistedTraits.length === 0) return

    await Promise.all(
      persistedTraits.map((traits) => {
        const { persistId, ...traitsWithoutPersistId } = traits
        return this.#setUserTraits(traitsWithoutPersistId)
      })
    )

    await this.#persistedAnalyticsTraitsAtom.set((prev) => {
      const prevTraits = prev ?? []
      return prevTraits.filter(
        ({ persistId }) => !persistedTraits.some((sentTrait) => sentTrait.persistId === persistId)
      )
    })
  }

  #canTrack = async ({ force, sample = 1 }) => {
    if (force) this.#logger.debug('`force` flag is set')

    const isSampled = Math.random() < sample
    return force || (isSampled && Boolean(await this.#shareActivityAtom.get()))
  }

  #warnOnce = memoize((msg) => this.#logger.warn(msg))

  setUserId = (userId) => {
    this.#tracker.setUserId(userId)
  }

  setExtraUserIds = (extraUserIds) => {
    this.setDefaultEventProperties({ childTelemetryIdentifiers: extraUserIds })
  }

  setAnonymousId = (userId) => {
    this.#tracker.setAnonymousId(userId)
  }

  requireDefaultEventProperties = (properties) => {
    for (const property of properties) {
      if (this.#propertiesPromises[property]) continue
      if (this.#tracker.defaultProperties[property] !== undefined) continue

      this.#propertiesPromises[property] = pDefer()
    }
  }

  /** @deprecated */
  requireDefaultProperties = (properties) => {
    this.#warnOnce('Please use requireDefaultEventProperties instead of requireDefaultProperties')
    return this.requireDefaultEventProperties(properties)
  }

  setDefaultEventProperties = (obj) => {
    this.#tracker.setDefaultProperties(obj)

    for (const property in obj) {
      this.#propertiesPromises[property]?.resolve()
    }
  }

  /** @deprecated */
  setDefaultProperties = (obj) => {
    this.#warnOnce('Please use setDefaultEventProperties instead of setDefaultProperties')
    return this.setDefaultEventProperties(obj)
  }

  setDefaultPropertiesForSanitizationErrors = (obj) => {
    this.#tracker.setDefaultPropertiesForSanitizationErrors(obj)
  }

  trackInstall = async () => {
    if (!this.#installEventReportingUrl) {
      throw new Error('installEventReportingUrl was not provided to the constructor')
    }

    // set a flag and send the event later because analytics wouldn't
    // be connected when the extension was just installed
    await this.#storage.set('postInstallEvent', true)
  }

  #trackOrPersistEvent = async ({ force, ...args }) => {
    if (this.#isTrackReady || force) {
      await this.#track(args)
    } else {
      await this.#persistEvent(args)
    }
  }

  #persistEvent = async (event) => {
    await this.#persistedAnalyticsEventsAtom.set((prev) => [
      ...(prev ?? []),
      {
        ...event,
        timestamp: new Date().toISOString(),
        persistId: `${Date.now()}-${this.#persistIdCounter++}`,
      },
    ])
  }

  #track = async (args) => {
    await this.#tracker.track(args)
  }

  track = async ({ force, sample, ...args }) => {
    try {
      if (await this.#canTrack({ force, sample }))
        await this.#trackOrPersistEvent({ force, ...args })
    } catch (error) {
      this.#logger.warn('Did not track the event ', args, error)
    }
  }

  linkUserIds = async ({ userId, anonymousId }) => {
    return this.#tracker.identify({ userId, anonymousId, traits: { telemetryId: userId } })
  }

  #persistTraits = async (traits) => {
    await this.#persistedAnalyticsTraitsAtom.set((prev) => [
      ...(prev ?? []),
      { ...traits, persistId: `${Date.now()}-${this.#persistIdCounter++}` },
    ])
  }

  #setOrPersistTraits = async ({ force, ...args }) => {
    if (this.#isTrackReady || force) {
      await this.#setUserTraits(args)
    } else {
      await this.#persistTraits(args)
    }
  }

  #setUserTraits = async (args) => {
    await this.#tracker.identify(args)
  }

  setUserTraits = async ({ force, ...args }) => {
    try {
      if (await this.#canTrack({ force })) await this.#setOrPersistTraits({ force, ...args })
    } catch (error) {
      this.#logger.warn('Did not identify ', args, error)
    }
  }

  /** @deprecated */
  identify = async (args) => {
    this.#warnOnce('Please use setUserTraits instead of identify')
    return this.setUserTraits(args)
  }
}

const createAnalytics = (args) => new Analytics({ ...args })

const analyticsModuleDefinition = {
  id: 'analytics',
  type: 'module',
  factory: createAnalytics,
  dependencies: [
    'shareActivityAtom',
    'storage',
    'analyticsTracker',
    'analyticsUserIdAtom',
    'persistedAnalyticsEventsAtom',
    'persistedAnalyticsTraitsAtom',
    'config',
    'logger',
    'fetch',
  ],
  public: true,
}

export default analyticsModuleDefinition
