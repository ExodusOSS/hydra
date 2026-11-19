/* oxlint-disable unicorn/no-await-expression-member */
import { createInMemoryAtom } from '@exodus/atoms'
import createContainer from '@exodus/dependency-injection'
import createInMemoryStorage from '@exodus/storage-memory'

import { featureFlagAtomsDefinition, featureFlagsAtomDefinition } from '../../atoms/index.js'
import featureFlagsModuleDefinition from '../index.js'

const versionSemver = '1.2.3'
const setup = ({ features, analyticsUserIdAtom }) => {
  const logger = console
  const ioc = createContainer({ logger })
  ioc.registerMultiple([
    ...(analyticsUserIdAtom
      ? [{ id: 'analyticsUserIdAtom', factory: () => analyticsUserIdAtom, public: true }]
      : []),
    {
      id: 'dogeModeFeatureFlagAtom',
      factory: () => createInMemoryAtom(),
      public: true,
    },
    {
      id: 'remoteConfigFeatureFlagAtoms',
      factory: ({ dogeModeFeatureFlagAtom }) => ({
        dogeMode: dogeModeFeatureFlagAtom,
      }),
      dependencies: ['dogeModeFeatureFlagAtom'],
      public: true,
    },
    {
      id: 'config',
      factory: () => ({ features }),
      public: true,
    },
    {
      id: 'geolocationAtom',
      factory: createInMemoryAtom,
      public: true,
    },
    {
      id: 'logger',
      factory: () => console,
      public: true,
    },
    {
      id: 'storage',
      factory: createInMemoryStorage,
      public: true,
    },
    {
      id: 'getBuildMetadata',
      factory: () => async () => ({ version: versionSemver }),
      public: true,
    },
    featureFlagsAtomDefinition,
    featureFlagAtomsDefinition,
    featureFlagsModuleDefinition,
  ])

  ioc.resolve()
  return ioc.getAll()
}

describe('feature-flags', () => {
  it('should throw on invalid `features`', () => {
    expect(() =>
      setup({
        features: {
          dogeMode: {
            localDefaults: {
              badField: '123',
            },
            remoteConfig: {
              path: 'a.b.c',
              supportedOverrides: {},
            },
          },
        },
      })
    ).toThrow(/badField/)

    expect(() =>
      setup({
        features: {
          dogeMode: {
            localDefaults: {
              available: false,
              enabled: true,
            },
          },
        },
      })
    ).toThrow(/cannot be enabled if it is not available/)
  })

  it('should accept valid `features`', () => {
    expect(() =>
      setup({
        features: {
          dogeMode: {
            localDefaults: {
              available: true,
            },
            remoteConfig: {
              path: 'a.b.c',
              supportedOverrides: {},
            },
          },
        },
      })
    ).not.toThrow()
  })

  const scenarios = [
    {
      detail: 'override `enabled` false -> true',
      localDefaults: {
        available: true,
        enabled: false,
      },
      remoteValue: {
        enabled: true,
      },
      supportedOverrides: {
        enabled: true,
      },
      result: {
        before: { isOn: false },
        after: { isOn: true },
      },
    },
    {
      detail: 'ignore override `enabled` if `enabled` override not supported',
      localDefaults: {
        available: true,
        enabled: false,
      },
      remoteValue: {
        enabled: true,
      },
      // ignore remote override, feature stays off
      supportedOverrides: {
        enabled: false,
      },
      result: {
        before: { isOn: false },
        after: { isOn: false },
      },
    },
    {
      detail: 'disable via shutdownSemver',
      localDefaults: {
        available: true,
        enabled: true,
      },
      remoteValue: {
        // disabled via remote config
        shutdownSemver: '<=' + versionSemver,
      },
      supportedOverrides: {
        shutdownSemver: true,
      },
      result: {
        before: { isOn: true },
        after: { isOn: false, unavailableReason: 'shutdownSemver' },
      },
    },
    {
      detail: 'ignore shutdownSemver if semver is not satisifed',
      localDefaults: {
        available: true,
        enabled: true,
      },
      remoteValue: {
        shutdownSemver: '<' + versionSemver,
      },
      supportedOverrides: {
        shutdownSemver: true,
      },
      result: {
        before: { isOn: true },
        after: { isOn: true },
      },
    },
    {
      detail: 'ignore shutdownSemver if semver override not supported',
      localDefaults: {
        available: true,
        enabled: true,
      },
      remoteValue: {
        shutdownSemver: '<' + versionSemver,
      },
      supportedOverrides: {
        shutdownSemver: false,
      },
      result: {
        before: { isOn: true },
        after: { isOn: true },
      },
    },
    {
      detail: 'disable via geolocation',
      localDefaults: {
        available: true,
        enabled: true,
      },
      geolocation: {
        countryCode: 'US',
      },
      remoteValue: {
        unavailableStatus: 'the world needs a break from this feature',
        geolocation: {},
      },
      supportedOverrides: {
        geolocation: true,
      },
      result: {
        before: { isOn: true },
        after: {
          isOn: false,
          unavailableStatus: 'the world needs a break from this feature',
          unavailableReason: 'geolocation',
        },
      },
    },
    {
      detail: 'keep enabled via geolocation if geolocation is a match',
      localDefaults: {
        available: true,
        enabled: true,
      },
      geolocation: {
        countryCode: 'US',
      },
      remoteValue: {
        geolocation: {
          countries: 'all',
        },
      },
      supportedOverrides: {
        geolocation: true,
      },
      result: {
        before: { isOn: true },
        after: { isOn: true },
      },
    },
    {
      detail: 'disable via geolocation for disabled countries in remote-config',
      localDefaults: {
        available: true,
        enabled: true,
      },
      geolocation: {
        countryCode: 'US',
      },
      remoteValue: {
        geolocation: {
          countries: 'all',
          disabledCountries: {
            US: 'United States of America',
          },
        },
      },
      supportedOverrides: {
        geolocation: true,
      },
      result: {
        before: { isOn: true },
        after: { isOn: false, unavailableReason: 'geolocation' },
      },
    },
    {
      detail: 'disable via client default geolocation when remote-config omits it',
      localDefaults: {
        available: true,
        enabled: true,
        geolocationValue: {
          countries: 'all',
          disabledCountries: {
            US: 'United States of America',
          },
        },
      },
      geolocation: {
        countryCode: 'US',
      },
      remoteValue: {},
      supportedOverrides: {
        geolocation: true,
      },
      result: {
        before: { isOn: true },
        after: { isOn: false, unavailableReason: 'geolocation' },
      },
    },
    {
      detail: 'disable via client default geolocation when remote-config has no entry at all',
      localDefaults: {
        available: true,
        enabled: true,
        geolocationValue: {
          countries: 'all',
          disabledCountries: {
            US: 'United States of America',
          },
        },
      },
      geolocation: {
        countryCode: 'US',
      },
      remoteValue: null,
      supportedOverrides: {
        geolocation: true,
      },
      result: {
        before: { isOn: true },
        after: { isOn: false, unavailableReason: 'geolocation' },
      },
    },
    {
      detail: 'remote-config geolocation overrides (loosens) the client default',
      localDefaults: {
        available: true,
        enabled: true,
        geolocationValue: {
          countries: 'all',
          disabledCountries: {
            US: 'United States of America',
          },
        },
      },
      geolocation: {
        countryCode: 'US',
      },
      remoteValue: {
        geolocation: {
          countries: 'all',
        },
      },
      supportedOverrides: {
        geolocation: true,
      },
      result: {
        before: { isOn: true },
        after: { isOn: true },
      },
    },
    {
      detail: 'ignore client geolocationValue when geolocation override not supported',
      localDefaults: {
        available: true,
        enabled: true,
        geolocationValue: {
          countries: 'all',
          disabledCountries: {
            US: 'United States of America',
          },
        },
      },
      geolocation: {
        countryCode: 'US',
      },
      remoteValue: {},
      supportedOverrides: {
        geolocation: false,
      },
      result: {
        before: { isOn: true },
        after: { isOn: true },
      },
    },
  ]

  it.each(scenarios)(
    'should update a feature flag via remote-config: $detail',
    async ({ localDefaults, geolocation, remoteValue, supportedOverrides, result }) => {
      const { featureFlags, featureFlagsAtom, geolocationAtom, dogeModeFeatureFlagAtom } = setup({
        features: {
          dogeMode: {
            localDefaults,
            remoteConfig: {
              path: 'dapps.dogeMode',
              supportedOverrides,
            },
          },
        },
      })

      await featureFlags.load()
      await new Promise(setImmediate)

      expect((await featureFlagsAtom.get()).dogeMode).toEqual(result.before)

      if (geolocation) await geolocationAtom.set(geolocation)
      await dogeModeFeatureFlagAtom.set(remoteValue)

      expect((await featureFlagsAtom.get()).dogeMode).toEqual(result.after)
    }
  )

  it('should persist flags when passed', async () => {
    const dogeMode = {
      persisted: true,
      localDefaults: { available: true },
      remoteConfig: {
        path: 'a.b.c',
        supportedOverrides: {},
      },
    }

    const { featureFlagAtoms, storage } = setup({ features: { dogeMode } })

    // Simulate module load
    await featureFlagAtoms.dogeMode.set({ isOn: true })

    await expect(storage.get('dogeMode')).resolves.toEqual({ isOn: true })
  })

  it('should clear flags', async () => {
    const dogeMode = {
      persisted: true,
      localDefaults: { available: true },
      remoteConfig: {
        path: 'a.b.c',
        supportedOverrides: {},
      },
    }

    const { featureFlags, featureFlagAtoms, storage } = setup({ features: { dogeMode } })

    // Simulate module load
    await featureFlagAtoms.dogeMode.set({ isOn: true })

    await featureFlags.clear()

    await expect(storage.get('dogeMode')).resolves.toEqual(undefined)
  })

  describe('rollout', () => {
    // bucket 29 for dogeMode, pinned in rollout-bucket.test.js
    const userId = 'cHiR1siXoRdEbFjbS+sFPgr+Hut27Co8LsUpJNdNMAY='
    const features = {
      dogeMode: {
        localDefaults: { available: true, enabled: false },
        remoteConfig: {
          path: 'dapps.dogeMode',
          supportedOverrides: { enabled: true, rollout: true },
        },
      },
    }

    it('requires analyticsUserIdAtom', () => {
      expect(() => setup({ features })).toThrow(/analyticsUserIdAtom/)
    })

    it.each([
      { rollout: 29, expected: { isOn: false, unavailableReason: 'rollout' } },
      { rollout: 30, expected: { isOn: true } },
    ])('opts in by telemetryId bucket at rollout $rollout', async ({ rollout, expected }) => {
      const analyticsUserIdAtom = createInMemoryAtom({ defaultValue: userId })
      const { featureFlags, featureFlagsAtom, dogeModeFeatureFlagAtom } = setup({
        features,
        analyticsUserIdAtom,
      })

      await featureFlags.load()
      await new Promise(setImmediate)
      await dogeModeFeatureFlagAtom.set({ enabled: true, rollout })
      await new Promise(setImmediate)

      expect((await featureFlagsAtom.get()).dogeMode).toEqual(expected)
    })

    it('keeps the local default until the telemetryId is known', async () => {
      const analyticsUserIdAtom = createInMemoryAtom()
      const { featureFlags, featureFlagsAtom, dogeModeFeatureFlagAtom } = setup({
        features: {
          dogeMode: { ...features.dogeMode, localDefaults: { available: true, enabled: true } },
        },
        analyticsUserIdAtom,
      })

      await featureFlags.load()
      await new Promise(setImmediate)
      await dogeModeFeatureFlagAtom.set({ enabled: true, rollout: 29 })
      await new Promise(setImmediate)
      expect((await featureFlagsAtom.get()).dogeMode).toEqual({ isOn: true })

      await analyticsUserIdAtom.set(userId)
      await new Promise(setImmediate)
      expect((await featureFlagsAtom.get()).dogeMode).toEqual({
        isOn: false,
        unavailableReason: 'rollout',
      })
    })
  })
})

// Helper for tests that need full control over the analyticsUserIdAtom timing.
const createControllableUserIdAtom = ({ initialValue } = {}) => {
  let value = initialValue
  let resolveInitial
  const initialPromise = new Promise((resolve) => (resolveInitial = resolve))
  const listeners = new Set()

  return {
    atom: {
      get: async () => {
        if (value === undefined) {
          await initialPromise
        }

        return value
      },
      observe: (cb) => {
        listeners.add(cb)
        if (value !== undefined) {
          // mimic real atom: schedule initial fire async
          const initialValueAtSubscribe = value
          queueMicrotask(() => {
            if (listeners.has(cb)) cb(initialValueAtSubscribe)
          })
        }

        return () => listeners.delete(cb)
      },
    },
    emit: (newValue) => {
      const isFirst = value === undefined
      value = newValue
      if (isFirst) resolveInitial?.()
      listeners.forEach((cb) => cb(newValue))
    },
  }
}

const flushMicrotasks = async () => {
  // Drain pending microtasks so async observe callbacks and void syncs complete.
  for (let i = 0; i < 10; i++) {
    await Promise.resolve()
  }
}

describe('feature-flags with provider', () => {
  const setupWithProvider = ({ features, provider, providerConfig, analyticsUserIdAtom }) => {
    const logger = console
    const ioc = createContainer({ logger })
    ioc.registerMultiple([
      {
        id: 'dogeModeFeatureFlagAtom',
        factory: () => createInMemoryAtom(),
        public: true,
      },
      {
        id: 'experimentFlagAtom',
        factory: () => createInMemoryAtom({ defaultValue: { isOn: false, value: false } }),
        public: true,
      },
      {
        id: 'remoteConfigFeatureFlagAtoms',
        factory: () => ({}),
        public: true,
      },
      {
        id: 'config',
        factory: () => ({ features, provider, providerConfig }),
        public: true,
      },
      {
        id: 'geolocationAtom',
        factory: () => createInMemoryAtom({ defaultValue: { countryCode: 'US' } }),
        public: true,
      },
      {
        id: 'storage',
        factory: createInMemoryStorage,
        public: true,
      },
      {
        id: 'getBuildMetadata',
        factory: () => async () => ({ version: '1.0.0', platform: 'test' }),
        public: true,
      },
      {
        id: 'analytics',
        factory: () => ({ track: jest.fn() }),
        public: true,
      },
      {
        id: 'analyticsUserIdAtom',
        factory: () => analyticsUserIdAtom ?? createInMemoryAtom({ defaultValue: 'user-123' }),
        public: true,
      },
      {
        ...featureFlagsAtomDefinition,
        dependencies: ['dogeModeFeatureFlagAtom', 'experimentFlagAtom'],
        factory: ({ dogeModeFeatureFlagAtom, experimentFlagAtom }) => ({
          get: async () => ({
            dogeMode: await dogeModeFeatureFlagAtom.get(),
            experimentFlag: await experimentFlagAtom.get(),
          }),
        }),
      },
      {
        ...featureFlagAtomsDefinition,
        dependencies: ['dogeModeFeatureFlagAtom', 'experimentFlagAtom'],
        factory: ({ dogeModeFeatureFlagAtom, experimentFlagAtom }) => ({
          dogeMode: dogeModeFeatureFlagAtom,
          experimentFlag: experimentFlagAtom,
        }),
      },
      featureFlagsModuleDefinition,
    ])

    ioc.resolve()
    return ioc.getAll()
  }

  let fetchSpy

  beforeEach(() => {
    jest.clearAllMocks()
    fetchSpy = jest.spyOn(global, 'fetch')
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  it('should call provider.sync with attributes on load', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ flags: { dogeMode: { variant_value: false } } }),
    })

    const { featureFlags } = setupWithProvider({
      features: {
        dogeMode: { localDefaults: { available: true } },
      },
      provider: 'mixpanel',
      providerConfig: { apiHost: 'https://api.example.com' },
    })

    await featureFlags.load()

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const calledUrl = new URL(fetchSpy.mock.calls[0][0])
    const context = JSON.parse(calledUrl.searchParams.get('context'))
    expect(context).toMatchObject({
      distinct_id: 'user-123',
      custom_properties: expect.objectContaining({
        countryCode: 'US',
      }),
    })
  })

  it('should sync provider flags to atoms after load', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        flags: {
          dogeMode: { variant_value: true },
        },
      }),
    })

    const { featureFlags, featureFlagAtoms } = setupWithProvider({
      features: {
        dogeMode: { localDefaults: { available: true } },
        experimentFlag: { localDefaults: { available: true } },
      },
      provider: 'mixpanel',
      providerConfig: { apiHost: 'https://api.example.com' },
    })

    await featureFlags.load()

    expect(await featureFlagAtoms.dogeMode.get()).toEqual({ isOn: true, value: true })
    expect(await featureFlagAtoms.experimentFlag.get()).toEqual({ isOn: false, value: false })
  })

  it('should return correct value from isEnabled', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        flags: {
          dogeMode: { variant_value: true },
          experimentFlag: { variant_value: false },
        },
      }),
    })

    const { featureFlags } = setupWithProvider({
      features: {
        dogeMode: { localDefaults: { available: true } },
        experimentFlag: { localDefaults: { available: true } },
      },
      provider: 'mixpanel',
      providerConfig: { apiHost: 'https://api.example.com' },
    })

    await featureFlags.load()

    expect(await featureFlags.isEnabled('dogeMode')).toBe(true)
    expect(await featureFlags.isEnabled('experimentFlag')).toBe(false)
    expect(await featureFlags.isEnabled('nonExistent')).toBe(false)
  })

  it('should return correct value from getValue', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        flags: {
          dogeMode: { variant_value: 'variant-b' },
          experimentFlag: { variant_value: 'variant-a' },
        },
      }),
    })

    const { featureFlags } = setupWithProvider({
      features: {
        dogeMode: { localDefaults: { available: true } },
        experimentFlag: { localDefaults: { available: true } },
      },
      provider: 'mixpanel',
      providerConfig: { apiHost: 'https://api.example.com' },
    })

    await featureFlags.load()

    expect(await featureFlags.getValue('experimentFlag', 'default')).toBe('variant-a')
    expect(await featureFlags.getValue('dogeMode', 'default')).toBe('variant-b')
    expect(await featureFlags.getValue('nonExistent', 'default')).toBe('default')
  })

  it('should call analytics.track on trackExposure', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        flags: {
          dogeMode: { variant_key: 'control', variant_value: true },
        },
      }),
    })

    const { featureFlags, analytics } = setupWithProvider({
      features: {
        dogeMode: { localDefaults: { available: true } },
      },
      provider: 'mixpanel',
      providerConfig: { apiHost: 'https://api.example.com' },
    })

    await featureFlags.load()
    await featureFlags.trackExposure('dogeMode')

    expect(analytics.track).toHaveBeenCalledWith({
      event: '$experiment_started',
      properties: {
        'Experiment name': 'dogeMode',
        'Variant name': 'control',
        $experiment_type: 'feature_flag',
      },
    })
  })

  describe('analyticsUserIdAtom', () => {
    const getDistinctIdFromCall = (call) => {
      const url = new URL(call[0])
      return JSON.parse(url.searchParams.get('context')).distinct_id
    }

    it('does not block load() when analyticsUserIdAtom never resolves', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ flags: { dogeMode: { variant_value: false } } }),
      })

      // Atom that never emits a value (simulates pre-unlock, where userId is
      // seed-derived and the atom is waiting on lockedAtom === false).
      const { atom: neverResolvingAtom } = createControllableUserIdAtom()

      const { featureFlags } = setupWithProvider({
        features: {
          dogeMode: { localDefaults: { available: true } },
        },
        provider: 'mixpanel',
        providerConfig: { apiHost: 'https://api.example.com' },
        analyticsUserIdAtom: neverResolvingAtom,
      })

      await featureFlags.load()
      await flushMicrotasks()

      expect(fetchSpy).toHaveBeenCalledTimes(1)
      expect(getDistinctIdFromCall(fetchSpy.mock.calls[0])).toBe('anonymous')
    })

    it('re-syncs with userId once analyticsUserIdAtom resolves after load()', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ flags: { dogeMode: { variant_value: false } } }),
      })

      const { atom: lateUserIdAtom, emit } = createControllableUserIdAtom()

      const { featureFlags } = setupWithProvider({
        features: {
          dogeMode: { localDefaults: { available: true } },
        },
        provider: 'mixpanel',
        providerConfig: { apiHost: 'https://api.example.com' },
        analyticsUserIdAtom: lateUserIdAtom,
      })

      await featureFlags.load()
      await flushMicrotasks()

      // Initial sync ran anonymously since the atom hadn't resolved.
      expect(fetchSpy).toHaveBeenCalledTimes(1)
      expect(getDistinctIdFromCall(fetchSpy.mock.calls[0])).toBe('anonymous')

      // Wallet unlocks → userId arrives.
      emit('user-after-unlock')
      await flushMicrotasks()

      expect(fetchSpy).toHaveBeenCalledTimes(2)
      expect(getDistinctIdFromCall(fetchSpy.mock.calls[1])).toBe('user-after-unlock')
    })

    it('does not re-sync when the observed userId is unchanged', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ flags: { dogeMode: { variant_value: false } } }),
      })

      const { atom, emit } = createControllableUserIdAtom({ initialValue: 'user-x' })

      const { featureFlags } = setupWithProvider({
        features: {
          dogeMode: { localDefaults: { available: true } },
        },
        provider: 'mixpanel',
        providerConfig: { apiHost: 'https://api.example.com' },
        analyticsUserIdAtom: atom,
      })

      await featureFlags.load()
      await flushMicrotasks()

      const callsAfterLoad = fetchSpy.mock.calls.length

      // Same userId emitted again — must not trigger a re-sync.
      emit('user-x')
      await flushMicrotasks()

      expect(fetchSpy).toHaveBeenCalledTimes(callsAfterLoad)
    })

    it('re-syncs when userId changes', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ flags: { dogeMode: { variant_value: false } } }),
      })

      const { atom, emit } = createControllableUserIdAtom({ initialValue: 'user-a' })

      const { featureFlags } = setupWithProvider({
        features: {
          dogeMode: { localDefaults: { available: true } },
        },
        provider: 'mixpanel',
        providerConfig: { apiHost: 'https://api.example.com' },
        analyticsUserIdAtom: atom,
      })

      await featureFlags.load()
      await flushMicrotasks()

      const callsAfterLoad = fetchSpy.mock.calls.length

      emit('user-b')
      await flushMicrotasks()

      expect(fetchSpy).toHaveBeenCalledTimes(callsAfterLoad + 1)
      const lastCall = fetchSpy.mock.calls[fetchSpy.mock.calls.length - 1]
      expect(getDistinctIdFromCall(lastCall)).toBe('user-b')
    })
  })

  it('should clear provider state on clear', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        flags: {
          dogeMode: { variant_value: true },
        },
      }),
    })

    const { featureFlags } = setupWithProvider({
      features: {
        dogeMode: { localDefaults: { available: true } },
      },
      provider: 'mixpanel',
      providerConfig: { apiHost: 'https://api.example.com' },
    })

    await featureFlags.load()
    expect(await featureFlags.isEnabled('dogeMode')).toBe(true)

    await featureFlags.clear()

    expect(await featureFlags.isEnabled('dogeMode')).toBe(false)
  })
})
