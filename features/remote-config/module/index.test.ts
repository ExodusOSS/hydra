import type { Atom } from '@exodus/atoms'
import { createInMemoryAtom } from '@exodus/atoms'
import errorTracking, { type ErrorsAtom, type ErrorTrackingModule } from '@exodus/error-tracking'
import type { Logger } from '@exodus/logger'
import lodash from 'lodash'

import type { Fetch, Freeze, RemoteConfigData } from '../types/index.js'
import generateRemoteConfigUrl from './generate-remote-config-url.js'
import type { RemoteConfig } from './index.js'
import remoteConfigDefinition from './index.js'

const { isEmpty, isEqual } = lodash

const errorTrackingDefinitions = errorTracking().definitions
const createErrorTracking = errorTrackingDefinitions.find(
  (definition) => definition.definition.id === 'errorTracking'
)?.definition.factory
const createErrorAtom = errorTrackingDefinitions.find(
  (definition) => definition.definition.id === 'errorsAtom'
)?.definition.factory
const createRemoteConfig = remoteConfigDefinition.factory

const getBuildMetadata = () =>
  Promise.resolve({
    appId: 'exodus-test',
    build: 'genesis',
    dev: true,
    deviceModel: 'MacBook',
    osName: 'Mac OS',
    platformName: 'desktop',
    version: '24.0.0.',
  })

describe('createRemoteConfig', () => {
  let errorTracking: ErrorTrackingModule
  let errorsAtom: ErrorsAtom
  let freeze: Freeze
  let logger: Logger
  let fetch: Fetch
  let remoteConfig: RemoteConfig

  const remoteConfigUrl = 'none'

  let config: Record<string, any>

  let remoteConfigAtom: Atom<RemoteConfigData>

  beforeEach(() => {
    errorsAtom = (createErrorAtom as any)()
    errorTracking = (createErrorTracking as any)({
      errorsAtom,
      config: { maxErrorsCount: 10 },
      logger: console,
    })
    freeze = jest.fn((val) => val)
    logger = { debug: jest.fn(), error: jest.fn() } as never as Logger
    fetch = jest.fn()
    config = {}
    remoteConfigAtom = createInMemoryAtom<RemoteConfigData>({ defaultValue: {} })
    ;(fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        headers: {
          get: () => new Date().toUTCString(),
        },
        json: () => ({
          data: config,
        }),
      })
    )
  })

  afterEach(() => {
    remoteConfig.stop()
  })

  const key = 'infrastructure.feeDelegationService'

  const expectedValue = { servers: ['https://nf.a.exodus.io'] }

  it('should get value for single key', (done) => {
    config = sampleConfig

    remoteConfig = createRemoteConfig({
      errorTracking,
      freeze,
      logger,
      fetch,
      config: {
        remoteConfigUrl,
        fetchInterval: 10,
      },
      getBuildMetadata,
      remoteConfigAtom,
    })

    void remoteConfig.load()

    void remoteConfig.get(key).then((value) => {
      expect(value).toEqual(expectedValue)
      done()
    })
  })

  it('should update remoteConfigAtom', async () => {
    config = sampleConfig

    remoteConfig = createRemoteConfig({
      errorTracking,
      freeze,
      logger,
      fetch,
      config: {
        remoteConfigUrl,
        fetchInterval: 10,
      },
      getBuildMetadata,
      remoteConfigAtom,
    })

    void remoteConfig.load()
    await remoteConfig.getAll()

    const state = await remoteConfigAtom.get()
    expect(state).toEqual({
      remoteConfigUrl,
      config: expect.any(Object),
      lastModified: expect.any(String),
    })
  })

  it('should be working with undefined config', async () => {
    config = sampleConfig

    remoteConfig = createRemoteConfig({
      errorTracking,
      freeze,
      logger,
      fetch,
      getBuildMetadata,
      remoteConfigAtom,
    })

    void remoteConfig.load()
    await remoteConfig.getAll()

    const remoteConfigUrl = await generateRemoteConfigUrl(getBuildMetadata)
    const state = await remoteConfigAtom.get()
    expect(state).toEqual({
      remoteConfigUrl,
      config: expect.any(Object),
      lastModified: expect.any(String),
    })
  })

  it('should get entire config', (done) => {
    config = sampleConfig

    remoteConfig = createRemoteConfig({
      errorTracking,
      freeze,
      logger,
      fetch,
      config: {
        remoteConfigUrl,
        fetchInterval: 10,
      },
      getBuildMetadata,
      remoteConfigAtom,
    })

    void remoteConfig.load()

    void remoteConfig.getAll().then((config) => {
      expect(config).toEqual(sampleConfig)
      done()
    })
  })

  it('should capture the error on failing loading remote config with invalid JSON', async () => {
    ;(fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        headers: {
          get: () => new Date().toUTCString(),
        },
        json: async () => {
          throw new Error('Unexpected end of input')
        },
      })
    )

    remoteConfig = createRemoteConfig({
      errorTracking,
      freeze,
      logger,
      fetch,
      config: {
        remoteConfigUrl,
        fetchInterval: 1,
      },
      getBuildMetadata,
      remoteConfigAtom,
    })

    void remoteConfig.load()

    await new Promise((resolve) => setTimeout(resolve, 100))
    const errors = await errorsAtom.get()

    const trackedError = errors.errors[0]!

    expect(trackedError.namespace).toEqual('remoteConfig')
    expect((trackedError.error as Error).message).toEqual(
      'Failed to parse remote config: invalid JSON'
    )
  })

  it('should capture the error when response.ok is false', async () => {
    ;(fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        headers: {
          get: () => new Date().toUTCString(),
        },
        json: async () => ({ data: {} }),
      })
    )

    remoteConfig = createRemoteConfig({
      errorTracking,
      freeze,
      logger,
      fetch,
      config: {
        remoteConfigUrl,
        fetchInterval: 1,
      },
      getBuildMetadata,
      remoteConfigAtom,
    })

    void remoteConfig.load()

    await new Promise((resolve) => setTimeout(resolve, 100))
    const errors = await errorsAtom.get()

    const trackedError = errors.errors[0]!

    expect(trackedError.namespace).toEqual('remoteConfig')
    expect((trackedError.error as Error).message).toEqual('Failed to fetch remote config: HTTP 500')
  })

  it('should trigger atom observer', (done) => {
    remoteConfig = createRemoteConfig({
      errorTracking,
      freeze,
      logger,
      fetch,
      config: {
        remoteConfigUrl,
        fetchInterval: 10,
      },
      getBuildMetadata,
      remoteConfigAtom,
    })
    void remoteConfig.load()

    remoteConfigAtom.observe(({ config }) => {
      if (!isEmpty(config)) {
        expect(isEqual(config, sampleConfig)).toBeTruthy()
        done()
      }
    })

    config = sampleConfig
  })

  it('should trigger observer only when there are changes', (done) => {
    remoteConfig = createRemoteConfig({
      errorTracking,
      freeze,
      logger,
      fetch,
      config: {
        remoteConfigUrl,
        fetchInterval: 10,
      },
      getBuildMetadata,
      remoteConfigAtom,
    })
    void remoteConfig.load()

    let syncEvents = 0
    remoteConfigAtom.observe(({ config }) => {
      if (!isEmpty(config)) syncEvents++
    })

    config = sampleConfig

    setTimeout(() => {
      expect(syncEvents).toEqual(1)
      done()
    }, 50)
  })

  const sampleConfig = {
    infrastructure: {
      feeDelegationService: {
        servers: ['https://nf.a.exodus.io'],
      },
      'price-server': {
        server: 'https://pricing.a.exodus.io',
      },
      'affiliate-server': {
        server: 'https://exit-d.exodus.io',
      },
    },
  }
})
