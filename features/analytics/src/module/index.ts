import createFetchival from '@exodus/fetch/experimental/create-fetchival'
import pDefer from 'p-defer'
import type { DeferredPromise } from 'p-defer'
import { memoize, restrictConcurrency } from '@exodus/basic-utils'
import type { Atom, Logger } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'
import type { Storage } from '@exodus/storage-interface'
import type { AnalyticsEventPayload } from '@exodus/analytics-validation'

import { normalizePropertyName } from './utils/index.js'
import { DEFAULT_FLUSH_TIMEOUT } from '../constants.js'

// Cap the persisted backlog and flush it in small chunks: an unbounded backlog flushed
// via a single Promise.all blocks the JS thread for its entire synchronous prep, and a
// backlog only cleared after full success compounds across sessions if the app dies mid-flush.
const MAX_PERSISTED_ENTRIES = 200
const FLUSH_CHUNK_SIZE = 10

export type AnalyticsTrackPayload<E extends string = string> = AnalyticsEventPayload<E> & {
  force?: boolean
  sample?: number
}

export type AnalyticsIdentifyPayload = {
  force?: boolean
  userId?: string
  anonymousId?: string
  [key: string]: any
}

type Tracker = {
  setUserId: (id: string) => void
  setAnonymousId: (id: string) => void
  identify: (args: Record<string, any>) => Promise<void>
  track: (args: Record<string, any>) => Promise<void>
  setDefaultProperties: (obj: Record<string, unknown>) => void
  setDefaultPropertiesForSanitizationErrors: (obj: Record<string, unknown>) => void
  defaultProperties: Record<string, unknown>
}

type PersistedEvent = AnalyticsTrackPayload & {
  persistId: string
  timestamp: string
}

type PersistedTrait = AnalyticsIdentifyPayload & {
  persistId: string
}

type AnalyticsParams = {
  fetch: typeof fetch
  storage: Storage<unknown>
  shareActivityAtom: Atom<boolean | undefined>
  analyticsUserIdAtom: Pick<Atom<string>, 'get'>
  persistedAnalyticsEventsAtom: Atom<PersistedEvent[] | undefined>
  persistedAnalyticsTraitsAtom: Atom<PersistedTrait[] | undefined>
  analyticsTracker: Tracker
  logger: Logger
  config?: {
    installEventReportingUrl?: string
    flushTimeout?: number
  }
}

export class Analytics {
  #logger: Logger
  #fetchival: ReturnType<typeof createFetchival>
  #storage: Storage<unknown>
  #tracker: Tracker
  #shareActivityAtom: Atom<boolean | undefined>
  #analyticsUserIdAtom: Pick<Atom<string>, 'get'>
  #persistedAnalyticsEventsAtom: Atom<PersistedEvent[] | undefined>
  #persistedAnalyticsTraitsAtom: Atom<PersistedTrait[] | undefined>
  #installEventReportingUrl: URL | undefined
  #propertiesPromises: Record<string, DeferredPromise<void>> = Object.create(null)
  #isTrackReady = false
  // Track which properties have been resolved.
  // We maintain this separately because p-defer doesn't expose promise state,
  // and we need to identify pending properties when the timeout fires
  #resolvedProperties = new Set<string>()
  // identifier for persisted events and traits
  #persistIdCounter = 0
  // Milliseconds to wait for required properties before timing out.
  // Analytics will continue after timeout to prevent hanging indefinitely. Default: 30 seconds.
  #flushTimeout: number

  constructor({
    fetch,
    storage,
    shareActivityAtom,
    analyticsUserIdAtom,
    persistedAnalyticsEventsAtom,
    persistedAnalyticsTraitsAtom,
    analyticsTracker,
    logger,
    config: { installEventReportingUrl, flushTimeout = DEFAULT_FLUSH_TIMEOUT } = {},
  }: AnalyticsParams) {
    this.#logger = logger
    this.#storage = storage
    this.#fetchival = createFetchival({ fetch })
    this.#shareActivityAtom = shareActivityAtom
    this.#analyticsUserIdAtom = analyticsUserIdAtom
    this.#persistedAnalyticsEventsAtom = persistedAnalyticsEventsAtom
    this.#persistedAnalyticsTraitsAtom = persistedAnalyticsTraitsAtom
    this.#tracker = analyticsTracker
    this.#installEventReportingUrl = installEventReportingUrl // optional
      ? new URL(installEventReportingUrl)
      : undefined
    this.#flushTimeout = flushTimeout
  }

  flush = restrictConcurrency(async (): Promise<void> => {
    const propertiesPromises = Object.values(this.#propertiesPromises).map((defer) => defer.promise)

    if (propertiesPromises.length > 0) {
      const { promise: timeoutPromise, timeoutId } = this.#createFlushTimeout()

      await Promise.race([Promise.all(propertiesPromises), timeoutPromise])

      clearTimeout(timeoutId)
    }

    this.#isTrackReady = true

    await Promise.all([
      this.#sendPersistedEvents(),
      this.#sendPersistedTraits(),
      this.#checkPostInstallEvent(),
    ])
  })

  /**
   * Creates a circuit breaker timeout for the flush operation.
   * If required properties aren't set within the timeout period,
   * logs an error with pending properties and resolves anyway to prevent hanging.
   */
  #createFlushTimeout = (): {
    promise: Promise<void>
    timeoutId: ReturnType<typeof setTimeout>
  } => {
    let timeoutId!: ReturnType<typeof setTimeout>
    const promise = new Promise<void>((resolve) => {
      timeoutId = setTimeout(() => {
        // Find properties that are still pending (not in resolvedProperties set)
        const pendingProperties = Object.keys(this.#propertiesPromises).filter(
          (property) => !this.#resolvedProperties.has(property)
        )

        if (pendingProperties.length > 0) {
          this.#logger.error(
            'Analytics flush timeout: some required default properties were never set. ' +
              'Analytics will continue without waiting for these properties.',
            {
              pendingProperties,
              timeoutMs: this.#flushTimeout,
            }
          )
        }

        resolve()
      }, this.#flushTimeout)
    })

    return { promise, timeoutId }
  }

  #checkPostInstallEvent = async (): Promise<void> => {
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

  #sendPersistedBacklog = async <T extends { persistId: string }>({
    atom,
    send,
    ordered = false,
  }: {
    atom: Atom<T[] | undefined>
    send: (entry: T) => Promise<void>
    ordered?: boolean
  }): Promise<void> => {
    const all = (await atom.get()) || []
    if (all.length === 0) return

    // Drop everything beyond the cap (oldest first) before sending. Trim off the live
    // value, not the snapshot: a snapshot write would clobber entries appended by a
    // persist that was already in flight when the flush began.
    const entries = all.slice(-MAX_PERSISTED_ENTRIES)
    if (entries.length < all.length) {
      await atom.set((prev) => (prev ?? []).slice(-MAX_PERSISTED_ENTRIES))
    }

    const trySend = (entry: T) =>
      send(entry).then(
        () => true,
        () => false
      )

    for (let i = 0; i < entries.length; i += FLUSH_CHUNK_SIZE) {
      const chunk = entries.slice(i, i + FLUSH_CHUNK_SIZE)
      const sent: boolean[] = []
      if (ordered) {
        // Sequential with stop-at-first-failure: ordered entries must reach the tracker
        // in queue order — within a flush and across retries — so the latest one wins.
        for (const entry of chunk) {
          const ok = await trySend(entry)
          sent.push(ok)
          if (!ok) break
        }
      } else {
        // Parallel within a bounded chunk: one failed send must not block the rest.
        sent.push(...(await Promise.all(chunk.map((entry) => trySend(entry)))))
      }

      // Clear only successfully sent entries, incrementally per chunk: an app kill
      // mid-flush keeps its progress, while failed sends stay queued and retry on the
      // next flush (the entry cap bounds regrowth).
      const sentIds = new Set(
        chunk.filter((_, index) => sent[index]).map((entry) => entry.persistId)
      )
      if (sentIds.size > 0) {
        await atom.set((prev) => {
          const prevEntries = prev ?? []
          return prevEntries.filter(({ persistId }) => !sentIds.has(persistId))
        })
      }

      if (ordered && sent.includes(false)) return
    }
  }

  #sendPersistedEvents = async (): Promise<void> => {
    await this.#sendPersistedBacklog({
      atom: this.#persistedAnalyticsEventsAtom,
      send: ({ persistId, ...event }) => this.#track(event),
    })
  }

  #sendPersistedTraits = async (): Promise<void> => {
    await this.#sendPersistedBacklog({
      atom: this.#persistedAnalyticsTraitsAtom,
      send: ({ persistId, ...traits }) => this.#setUserTraits(traits),
      // Traits are declarative state, not timestamped facts: replay order decides
      // the final value, so they cannot be sent in parallel like events.
      ordered: true,
    })
  }

  #canTrack = async ({
    force,
    sample = 1,
  }: {
    force?: boolean
    sample?: number
  }): Promise<boolean> => {
    if (force) this.#logger.debug('`force` flag is set')

    const isSampled = Math.random() < sample
    return Boolean(force) || (isSampled && Boolean(await this.#shareActivityAtom.get()))
  }

  #warnOnce = memoize((msg: string) => this.#logger.warn(msg))

  setUserId = (userId: string): void => {
    this.#tracker.setUserId(userId)
  }

  setAnonymousId = (userId: string): void => {
    this.#tracker.setAnonymousId(userId)
  }

  requireDefaultEventProperties = (properties: string[]): void => {
    for (const property of properties) {
      const normalizedProperty = normalizePropertyName(property)

      if (this.#propertiesPromises[normalizedProperty]) continue

      // Check if property already exists in tracker (check both formats for backwards compatibility)
      if (
        this.#tracker.defaultProperties[normalizedProperty] !== undefined ||
        this.#tracker.defaultProperties[property] !== undefined
      ) {
        continue
      }

      this.#propertiesPromises[normalizedProperty] = pDefer<void>()
    }
  }

  /** @deprecated */
  requireDefaultProperties = (properties: string[]): void => {
    this.#warnOnce('Please use requireDefaultEventProperties instead of requireDefaultProperties')
    return this.requireDefaultEventProperties(properties)
  }

  setDefaultEventProperties = (obj: Record<string, unknown>): void => {
    this.#tracker.setDefaultProperties(obj)

    for (const property in obj) {
      const normalizedProperty = normalizePropertyName(property)
      this.#resolvedProperties.add(normalizedProperty)
      this.#propertiesPromises[normalizedProperty]?.resolve()
    }
  }

  /** @deprecated */
  setDefaultProperties = (obj: Record<string, unknown>): void => {
    this.#warnOnce('Please use setDefaultEventProperties instead of setDefaultProperties')
    return this.setDefaultEventProperties(obj)
  }

  setDefaultPropertiesForSanitizationErrors = (obj: Record<string, unknown>): void => {
    this.#tracker.setDefaultPropertiesForSanitizationErrors(obj)
  }

  trackInstall = async (): Promise<void> => {
    if (!this.#installEventReportingUrl) {
      throw new Error('installEventReportingUrl was not provided to the constructor')
    }

    // set a flag and send the event later because analytics wouldn't
    // be connected when the extension was just installed
    await this.#storage.set('postInstallEvent', true)
  }

  #trackOrPersistEvent = async ({ force, ...args }: AnalyticsTrackPayload): Promise<void> => {
    if (this.#isTrackReady || force) {
      await this.#track(args)
    } else {
      await this.#persistEvent(args)
    }
  }

  #persistEvent = async (event: AnalyticsTrackPayload): Promise<void> => {
    await this.#persistedAnalyticsEventsAtom.set((prev) => [
      ...(prev ?? []).slice(-(MAX_PERSISTED_ENTRIES - 1)),
      {
        ...event,
        timestamp: new Date().toISOString(),
        persistId: `${Date.now()}-${this.#persistIdCounter++}`,
      },
    ])
  }

  #track = async (args: Record<string, any>): Promise<void> => {
    await this.#tracker.track(args)
  }

  track = async <E extends string>({
    force,
    sample,
    ...args
  }: AnalyticsTrackPayload<E>): Promise<void> => {
    try {
      if (await this.#canTrack({ force, sample })) {
        await this.#trackOrPersistEvent({ force, ...args })
      }
    } catch (error) {
      this.#logger.warn('Did not track the event ', args, error)
    }
  }

  linkUserIds = async ({
    userId,
    anonymousId,
  }: {
    userId: string
    anonymousId: string
  }): Promise<void> => {
    return this.#tracker.identify({ userId, anonymousId, traits: { telemetryId: userId } })
  }

  #persistTraits = async (traits: AnalyticsIdentifyPayload): Promise<void> => {
    await this.#persistedAnalyticsTraitsAtom.set((prev) => {
      const prevTraits = prev ?? []
      // Traits are declarative and replayed in queue order: drop any identical queued
      // payload and re-append it (move-to-end), so the latest assertion is replayed last.
      const incoming = JSON.stringify(traits)
      const deduped = prevTraits.filter(
        ({ persistId, ...rest }) => JSON.stringify(rest) !== incoming
      )

      return [
        ...deduped.slice(-(MAX_PERSISTED_ENTRIES - 1)),
        {
          ...traits,
          persistId: `${Date.now()}-${this.#persistIdCounter++}`,
        },
      ]
    })
  }

  #setOrPersistTraits = async ({ force, ...args }: AnalyticsIdentifyPayload): Promise<void> => {
    if (this.#isTrackReady || force) {
      await this.#setUserTraits(args)
    } else {
      await this.#persistTraits(args)
    }
  }

  #setUserTraits = async (args: AnalyticsIdentifyPayload): Promise<void> => {
    await this.#tracker.identify(args)
  }

  setUserTraits = async ({ force, ...args }: AnalyticsIdentifyPayload): Promise<void> => {
    try {
      if (await this.#canTrack({ force })) {
        await this.#setOrPersistTraits({ force, ...args })
      }
    } catch (error) {
      this.#logger.warn('Did not identify ', args, error)
    }
  }

  /** @deprecated */
  identify = async (args: AnalyticsIdentifyPayload): Promise<void> => {
    this.#warnOnce('Please use setUserTraits instead of identify')
    return this.setUserTraits(args)
  }
}

const createAnalytics = (args: AnalyticsParams): Analytics => new Analytics({ ...args })

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
} as const satisfies Definition

export default analyticsModuleDefinition
