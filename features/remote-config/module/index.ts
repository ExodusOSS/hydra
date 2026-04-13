import ms from 'ms'
import delay from 'delay'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import type { Atom } from '@exodus/atoms'
import type { ErrorTrackingModule } from '@exodus/error-tracking'
import { synchronizeTime } from './helpers.js'
import type {
  Fetch,
  Freeze,
  RemoteConfigData,
  RemoteConfigType,
  GetBuildMetadata,
} from '../types/index.js'
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
  remoteConfigAtom: Atom<RemoteConfigData>
  freeze: Freeze
  logger: Logger
  fetch: Fetch
  getBuildMetadata: GetBuildMetadata
  config?: Config
}

const getModificationIndicator = (response: Response) =>
  response.headers.get('Last-Modified') || response.headers.get('ETag')

export class RemoteConfig implements RemoteConfigType {
  #started = false
  #isUpdating = false
  #current?: Record<string, any>
  #remoteConfigAtom: Atom<RemoteConfigData>

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
    remoteConfigAtom,
  }: ConstructorParameters) {
    this.#errorTracking = errorTracking
    this.#logger = logger
    this.#fetch = (...args) => fetch(...args)
    this.#freeze = freeze
    this.#config = config || Object.create(null)
    this.#remoteConfigUrl = config?.remoteConfigUrl
    this.#getBuildMetadata = getBuildMetadata
    this.#remoteConfigAtom = remoteConfigAtom
  }

  /**
   * @deprecated
   */
  get remoteConfigAtom() {
    return this.#remoteConfigAtom
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

  /**
   * @deprecated
   */
  sync = () => {
    this.#logger.warn('remoteConfig no longer supports the "sync" method')
  }

  stop = () => {
    this.#started = false
    this.#timer?.clear()
  }

  update = async () => {
    if (this.#isUpdating) return { success: true }

    try {
      this.#isUpdating = true

      const { config: current, lastModified: _lastModified } = await this.#remoteConfigAtom.get()
      if (!this.#current && current) {
        this.#current = this.#freeze(current)
      }

      const { config, lastModified } = await this.#fetchConfig({ lastModified: _lastModified })

      const changes = config && (!this.#current || !isEqual(config, this.#current))

      if (changes) {
        this.#current = this.#freeze(config)
        this.#logger.debug('updated config with changes from remote')

        void this.#remoteConfigAtom.set({
          config,
          lastModified,
          remoteConfigUrl: this.#remoteConfigUrl!,
        })
      }

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

  #fetchConfig = async ({
    lastModified: currentLastModified,
  }: {
    lastModified?: string | null
  }): Promise<{ lastModified?: string | null; config?: Record<string, any> }> => {
    if (!this.#remoteConfigUrl) {
      this.#remoteConfigUrl = await generateRemoteConfigUrl(this.#getBuildMetadata)
    }

    const url = `${this.#remoteConfigUrl}?cacheBump=0`
    const headers = { Accept: 'application/json' }
    const method: string = currentLastModified ? 'head' : 'get'

    this.#logger.debug(`trying to fetch remote config from ${this.#remoteConfigUrl} ...`)
    let response = await synchronizeTime(() => this.#fetch(url, { method, headers }))

    let lastModified = getModificationIndicator(response)
    if (lastModified && lastModified === currentLastModified) {
      this.#logger.debug('remote config unmodified')
      return {}
    }

    if (method === 'head') {
      // last fetch was a HEAD request
      response = await this.#fetch(url, { method: 'get', headers })
      lastModified = getModificationIndicator(response)
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch remote config: HTTP ${response.status}`)
    }

    let body: { data?: unknown }
    try {
      body = await response.json()
    } catch {
      throw new Error('Failed to parse remote config: invalid JSON')
    }

    const { data } = body

    if (!data || typeof data !== 'object') {
      throw new TypeError('invalid body data')
    }

    this.#logger.debug('remote config fetched')

    return { config: data, lastModified }
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
  remoteConfigAtom,
}: ConstructorParameters): RemoteConfig => {
  return new RemoteConfig({
    errorTracking,
    logger,
    fetch,
    freeze,
    config,
    getBuildMetadata,
    remoteConfigAtom,
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
    'remoteConfigAtom',
    'getBuildMetadata',
    'config?',
    'errorTracking',
  ],
  public: true,
} as const satisfies Definition

export default remoteConfigDefinition
