import { createInMemoryAtom } from '@exodus/atoms'
import createContainer from '@exodus/dependency-injection'
import createInMemoryStorage from '@exodus/storage-memory'
import featureFlagsModuleDefinition from '../../'
import {
  featureFlagAtomsDefinition,
  featureFlagsAtomDefinition,
  remoteConfigFeatureFlagAtomsDefinition,
} from '../../../atoms'
import createRemoteConfigWithData from '../../../shared/__tests__/dummy-remote-config'

const dummyGeolocationAtom = createInMemoryAtom({
  defaultValue: { countries: 'all' },
})

describe('example with dependency injection', () => {
  test('with dependency injection', (done) => {
    const config = {
      features: {
        dogeMode: {
          localDefaults: {
            available: true,
            enabled: true,
          },
          remoteConfig: {
            path: 'dapps.dogeMode',
            supportedOverrides: {
              enabled: true,
              shutdownSemver: true,
              geolocation: true,
            },
          },
        },
      },
    }

    // NOTE: create a real one using @exodus/remote/config if you're not living in a simulation
    const remoteConfig = createRemoteConfigWithData({
      data: {
        dapps: {
          dogeMode: {
            enabled: true,
          },
        },
      },
    })

    const container = createContainer({ logger: console })
    container.registerMultiple([
      {
        id: 'logger',
        factory: () => console,
      },
      {
        id: 'geolocationAtom',
        factory: () => dummyGeolocationAtom,
      },
      {
        id: 'remoteConfig',
        factory: () => remoteConfig,
      },
      {
        id: 'config',
        factory: () => config,
      },
      {
        id: 'storage',
        factory: createInMemoryStorage,
      },
      {
        id: 'getBuildMetadata',
        factory: () => async () => ({ version: '1.2.3' }),
      },
      featureFlagsModuleDefinition,
      remoteConfigFeatureFlagAtomsDefinition,
      featureFlagsAtomDefinition,
      featureFlagAtomsDefinition,
    ])

    container.resolve()
    const { featureFlagsAtom } = container.getAll()

    featureFlagsAtom.observe(() => {
      done()
    })
  })
})
