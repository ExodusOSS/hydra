import ms from 'ms'
import delay from 'delay'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import EventEmitter from 'eventemitter3'
import type { Atom } from '@exodus/atoms'
import type { ErrorTrackingModule } from '@exodus/error-tracking'
import { synchronizeTime, isFreezable } from './helpers.js'
import type { Fetch, Freeze, RemoteConfigType, GetBuildMetadata } from '../types/index.js'
import type { RemoteConfigStatus } from '../atoms/index.js'
import type { Definition } from '@exodus/dependency-types'
import type { Logger } from '@exodus/logger'

import generateRemoteConfigUrl from './generate-remote-config-url.js'
import { safeString } from '@exodus/safe-string'

const { get, isEqual } = lodash

type Config = {
  remoteConfigUrl?: string
  fetchInterval?: number
  errorBackoffTime?: number
}

type ConstructorParameters = {
  errorTracking: ErrorTrackingModule
  remoteConfigStatusAtom: Atom<RemoteConfigStatus>
  freeze: Freeze
  logger: Logger
  fetch: Fetch
  getBuildMetadata: GetBuildMetadata
  config?: Config
}

export class RemoteConfig extends EventEmitter implements RemoteConfigType {
  #started = false
  #isUpdating = false
  #current?: Record<string, any>
  #previous?: Record<string, any>
  #lastModified?: string
  #loadedStatusAtom: Atom<RemoteConfigStatus>

  #remoteConfigUrl?: string
  #getBuildMetadata: GetBuildMetadata

  readonly #errorTracking: ErrorTrackingModule
  readonly #logger: Logger
  readonly #fetch: Fetch
  readonly #freeze: Freeze

  #resolveLoaded?: () => void

  readonly #whenLoaded = new Promise<void>((resolve) => {
    this.#resolveLoaded = resolve
  })

  readonly #config: Config

  #timer?: Promise<void> & { clear: () => void }

  constructor({
    errorTracking,
    logger,
    freeze,
    fetch,
    config,
    getBuildMetadata,
    remoteConfigStatusAtom,
  }: ConstructorParameters) {
    super()

    this.#errorTracking = errorTracking
    this.#logger = logger
    this.#fetch = (...args) => fetch(...args)
    this.#freeze = freeze
    this.#config = config || Object.create(null)
    this.#remoteConfigUrl = config?.remoteConfigUrl
    this.#getBuildMetadata = getBuildMetadata
    this.#loadedStatusAtom = remoteConfigStatusAtom
  }

  /**
   * Get the value for a key, or default value if configured and no value
   * present. Waits for initial fetch from remote to complete.
   * @param key
   */

  get = async (key: string) => {
    await this.#whenLoaded
    return get(this.#current, key)
  }

  /**
   * Get the entire config. Waits for initial fetch from remote to
   * complete.
   */

  getAll = async () => {
    await this.#whenLoaded
    return this.#current!
  }

  /**
   * Loads the configuration from the remote and periodically queries for
   * updates as defined by FETCH_INTERVAL. Do not await as this never
   * finishes.
   */

  load = async () => {
    if (this.#started) return

    const { fetchInterval = ms('2m'), errorBackoffTime = ms('5s') } = this.#config

    this.#started = true

    while (this.#started) {
      const { error } = await this.update()

      if (!this.#started) break // eslint-disable-line @typescript-eslint/no-unnecessary-condition

      this.#timer = delay(error ? errorBackoffTime : fetchInterval)

      await this.#timer
    }
  }

  sync = () => {
    this.#emit('sync', { current: this.#current, previous: this.#previous })
  }

  stop = () => {
    this.#started = false
    this.#timer?.clear()
  }

  #emit = (name: string, ...args: any[]) => {
    return super.emit(name, ...args.map((arg) => (isFreezable(arg) ? this.#freeze(arg) : arg)))
  }

  update = async () => {
    if (this.#isUpdating) return { success: true }

    try {
      this.#isUpdating = true

      const { config, modified } = await this.#fetchConfig()
      const changes = modified && (!this.#current || !isEqual(config, this.#current))

      if (changes) {
        this.#previous = this.#current
        this.#current = this.#freeze(config)
        this.sync()
        this.#logger.debug('updated config with changes from remote')
      }

      void this.#loadedStatusAtom.set({
        remoteConfigUrl: this.#remoteConfigUrl!,
        loaded: true,
        gitHash: this.#current?.meta?.gitHash ?? null,
      })
      this.#resolveLoaded!()
      return { success: true }
    } catch (error: unknown) {
      void this.#errorTracking.track({
        error: error as Error,
        namespace: safeString`remoteConfig`,
      })
      this.#logger.error(error)
      return { error }
    } finally {
      this.#isUpdating = false
    }
  }

  #fetchConfig = async () => {
    if (!this.#remoteConfigUrl) {
      this.#remoteConfigUrl = await generateRemoteConfigUrl(this.#getBuildMetadata)
    }

    const url = `${this.#remoteConfigUrl}?cacheBump=0`
    const headers = { Accept: 'application/json' }
    const method: string = this.#lastModified ? 'head' : 'get'

    this.#logger.debug(`trying to fetch remote config from ${this.#remoteConfigUrl} ...`)
    let response = await synchronizeTime(() => this.#fetch(url, { method, headers }))

    const lastModified = response.headers.get('Last-Modified')
    if (lastModified && lastModified === this.#lastModified) {
      this.#logger.debug('remote config unmodified')
      return { modified: false }
    }

    if (this.#lastModified) {
      // last fetch was a HEAD request
      response = await this.#fetch(url, { headers })
    }

    const { data } = await response.json()

    if (!data || typeof data !== 'object') {
      throw new TypeError('invalid body data')
    }

    if (lastModified) {
      this.#lastModified = lastModified
    }

    this.#logger.debug('remote config fetched')

    return { config: data, modified: true }
  }
}

/**
 * Creates a Config adapter around a remote config monitor from the given parameters
 *
 * Takes an object with the following properties:
 * @param freeze Function that takes an object and returns a frozen version of it. Used to seal emitted events' payload.
 * @param fetch Spec compliant fetch function
 * @param config
 * @param config.remoteConfigUrl URL pointing to the remote config to be used
 * @param config.fetchInterval Optional fetch interval, defaults to 2min
 * @param config.errorBackoffTime Optional error backoff time, defaults to 5s
 * set/get that are not defined in this config. Defaults to a throwingMissingDefinitionHandler that throws an Error when
 * accessing undefined keys.
 */

const createRemoteConfig = ({
  errorTracking,
  freeze,
  logger,
  fetch,
  config,
  getBuildMetadata,
  remoteConfigStatusAtom,
}: ConstructorParameters): RemoteConfig => {
  return new RemoteConfig({
    errorTracking,
    logger,
    fetch,
    freeze,
    config,
    getBuildMetadata,
    remoteConfigStatusAtom,
  })
}

const remoteConfigDefinition = {
  id: 'remoteConfig',
  type: 'module',
  factory: createRemoteConfig,
  dependencies: [
    'fetch',
    'freeze',
    'logger',
    'remoteConfigStatusAtom',
    'getBuildMetadata',
    'config?',
    'errorTracking',
  ],
  public: true,
} as const satisfies Definition

export default remoteConfigDefinition
