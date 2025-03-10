import { mapValuesAsync } from '@exodus/basic-utils'
import createIOC from '@exodus/dependency-injection'
import createInMemoryStorage from '@exodus/storage-memory'
import { once } from 'events/events.js'

import {
  featureFlagAtomsDefinition,
  featureFlagsAtomDefinition,
  remoteConfigFeatureFlagAtomsDefinition,
} from '../../atoms/index.js'
import createRemoteConfigWithData from '../../shared/__tests__/dummy-remote-config.js'

jest.useFakeTimers()

const setup = ({ features, remoteConfigValue }) => {
  const logger = console
  const ioc = createIOC({ logger })
  ioc.registerMultiple([
    {
      id: 'remoteConfig',
      factory: () =>
        createRemoteConfigWithData({
          data: remoteConfigValue,
        }),
      public: true,
    },
    {
      id: 'config',
      factory: () => ({ features }),
      public: true,
    },
    {
      id: 'storage',
      factory: createInMemoryStorage,
      public: true,
    },
    remoteConfigFeatureFlagAtomsDefinition,
    featureFlagsAtomDefinition,
    featureFlagAtomsDefinition,
  ])

  ioc.resolve()
  return ioc.getAll()
}

describe('remoteConfigFeatureFlagsAtom', () => {
  it('should prune non-remote-configurable features', () => {
    const { remoteConfigFeatureFlagAtoms } = setup({
      features: {
        btcMode: {
          localDefaults: {
            available: true,
            enabled: true,
          },
        },
        dogeMode: {
          localDefaults: {
            available: true,
            enabled: true,
          },
          remoteConfig: {
            path: 'dapps.dogeMode',
            supportedOverrides: {},
          },
        },
      },
    })

    expect(Object.keys(remoteConfigFeatureFlagAtoms)).toEqual(['dogeMode'])
  })

  it.each([
    {
      detail: 'object format',
      remoteValue: {
        enabled: true,
      },
      result: {
        enabled: true,
      },
    },
    {
      detail: 'boolean format',
      remoteValue: true,
      result: {
        enabled: true,
      },
    },
  ])(
    'should return the value at the path for each atom: $detail',
    async ({ remoteValue, result }) => {
      const { remoteConfig, remoteConfigFeatureFlagAtoms } = setup({
        features: {
          dogeMode: {
            localDefaults: {
              available: true,
              enabled: true,
            },
            remoteConfig: {
              path: 'dapps.dogeMode',
              supportedOverrides: {},
            },
          },
        },
        remoteConfigValue: {
          dapps: {
            dogeMode: remoteValue,
          },
        },
      })

      remoteConfig.load()
      await once(remoteConfig, 'sync')

      expect(await remoteConfigFeatureFlagAtoms.dogeMode.get()).toEqual(result)

      remoteConfig.stop()
      jest.runAllTimers()
    }
  )
})

describe('featureFlagAtoms', () => {
  it('has an atom per feature in featureFlagsAtoms', () => {
    const { featureFlagAtoms } = setup({
      features: {
        btcMode: {
          localDefaults: {
            available: true,
            enabled: true,
          },
        },
        dogeMode: {
          localDefaults: {
            available: true,
            enabled: true,
          },
          remoteConfig: {
            path: 'dapps.dogeMode',
            supportedOverrides: {},
          },
        },
      },
    })

    expect(Object.keys(featureFlagAtoms).sort()).toEqual(['btcMode', 'dogeMode'])
  })

  it('defaults featureFlagsAtoms to the local value', async () => {
    const { featureFlagAtoms } = setup({
      features: {
        btcMode: {
          localDefaults: {
            available: true,
            enabled: true,
          },
        },
        dogeMode: {
          localDefaults: {
            available: true,
            enabled: false,
          },
          remoteConfig: {
            path: 'dapps.dogeMode',
            supportedOverrides: {},
          },
        },
      },
    })

    expect(await mapValuesAsync(featureFlagAtoms, (atom) => atom.get())).toEqual({
      btcMode: { isOn: true },
      dogeMode: { isOn: false },
    })
  })
})

describe('featureFlagsAtom', () => {
  it('defaults to the local value', async () => {
    const { featureFlagsAtom } = setup({
      features: {
        btcMode: {
          localDefaults: {
            available: true,
            enabled: true,
          },
        },
        dogeMode: {
          localDefaults: {
            available: true,
            enabled: false,
          },
          remoteConfig: {
            path: 'dapps.dogeMode',
            supportedOverrides: {},
          },
        },
      },
    })

    expect(await featureFlagsAtom.get()).toEqual({
      btcMode: { isOn: true },
      dogeMode: { isOn: false },
    })
  })
})
