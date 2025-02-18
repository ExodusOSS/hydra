import type { Atom } from '@exodus/atoms'
import type { Logger } from '@exodus/logger'
import lodash from 'lodash'

import type { RemoteConfigStatus } from '../atoms/index.js'
import remoteConfigStatusAtomDefinition from '../atoms/index.js'
import type { Fetch, Freeze } from '../types/index.js'
import generateRemoteConfigUrl from './generate-remote-config-url.js'
import type { RemoteConfig } from './index.js'
import remoteConfigDefinition from './index.js'

const { isEmpty, isEqual } = lodash

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
  let freeze: Freeze
  let logger: Logger
  let fetch: Fetch
  let remoteConfig: RemoteConfig

  const remoteConfigUrl = 'none'

  let config: Record<string, any>

  let remoteConfigStatusAtom: Atom<RemoteConfigStatus>

  beforeEach(() => {
    freeze = jest.fn((val) => val)
    logger = { debug: jest.fn(), error: jest.fn() } as never as Logger
    fetch = jest.fn()
    config = {}
    remoteConfigStatusAtom = remoteConfigStatusAtomDefinition.factory()
    ;(fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
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
      freeze,
      logger,
      fetch,
      config: {
        remoteConfigUrl,
        fetchInterval: 10,
      },
      getBuildMetadata,
      remoteConfigStatusAtom,
    })

    void remoteConfig.load()

    void remoteConfig.get(key).then((value) => {
      expect(value).toEqual(expectedValue)
      done()
    })
  })

  it('should update remoteConfigStatusAtom', async () => {
    config = sampleConfig

    remoteConfig = createRemoteConfig({
      freeze,
      logger,
      fetch,
      config: {
        remoteConfigUrl,
        fetchInterval: 10,
      },
      getBuildMetadata,
      remoteConfigStatusAtom,
    })

    void remoteConfig.load()
    await remoteConfig.getAll()

    const state = await remoteConfigStatusAtom.get()
    expect(state).toEqual({
      remoteConfigUrl,
      error: null,
      loaded: true,
    })
  })

  it('should be working with undefined config', async () => {
    config = sampleConfig

    remoteConfig = createRemoteConfig({
      freeze,
      logger,
      fetch,
      getBuildMetadata,
      remoteConfigStatusAtom,
    })

    void remoteConfig.load()
    await remoteConfig.getAll()

    const remoteConfigUrl = await generateRemoteConfigUrl(getBuildMetadata)
    const state = await remoteConfigStatusAtom.get()
    expect(state).toEqual({
      remoteConfigUrl,
      error: null,
      loaded: true,
    })
  })

  it('should get entire config', (done) => {
    config = sampleConfig

    remoteConfig = createRemoteConfig({
      freeze,
      logger,
      fetch,
      config: {
        remoteConfigUrl,
        fetchInterval: 10,
      },
      getBuildMetadata,
      remoteConfigStatusAtom,
    })

    void remoteConfig.load()

    void remoteConfig.getAll().then((config) => {
      expect(config).toEqual(sampleConfig)
      done()
    })
  })

  it('should capture the error on failing loading remote config', async () => {
    ;(fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        headers: {
          get: () => new Date().toUTCString(),
        },
        json: async () => {
          throw new Error('failed')
        },
      })
    )

    remoteConfig = createRemoteConfig({
      freeze,
      logger,
      fetch,
      config: {
        remoteConfigUrl,
        fetchInterval: 1,
      },
      getBuildMetadata,
      remoteConfigStatusAtom,
    })

    void remoteConfig.load()

    await new Promise((resolve) => setTimeout(resolve, 100))
    const report = await remoteConfigStatusAtom.get()

    expect(report.error).toEqual('failed')
  })

  it('should emit sync event', (done) => {
    remoteConfig = createRemoteConfig({
      freeze,
      logger,
      fetch,
      config: {
        remoteConfigUrl,
        fetchInterval: 10,
      },
      getBuildMetadata,
      remoteConfigStatusAtom,
    })
    void remoteConfig.load()

    remoteConfig.on('sync', ({ current }) => {
      if (!isEmpty(current)) {
        expect(isEqual(current, sampleConfig)).toBeTruthy()
        done()
      }
    })

    config = sampleConfig
  })

  it('should sync only when there are changes', (done) => {
    remoteConfig = createRemoteConfig({
      freeze,
      logger,
      fetch,
      config: {
        remoteConfigUrl,
        fetchInterval: 10,
      },
      getBuildMetadata,
      remoteConfigStatusAtom,
    })
    void remoteConfig.load()

    let syncEvents = 0
    remoteConfig.on('sync', () => {
      syncEvents++
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
