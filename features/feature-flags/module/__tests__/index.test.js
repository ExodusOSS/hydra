/* eslint-disable unicorn/no-await-expression-member */
import { createInMemoryAtom } from '@exodus/atoms'
import createContainer from '@exodus/dependency-injection'
import createInMemoryStorage from '@exodus/storage-memory'

import { featureFlagAtomsDefinition, featureFlagsAtomDefinition } from '../../atoms'
import featureFlagsModuleDefinition from '../'

const versionSemver = '1.2.3'
const setup = ({ features }) => {
  const logger = console
  const ioc = createContainer({ logger })
  ioc.registerMultiple([
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
})
