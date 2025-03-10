import { createInMemoryAtom } from '@exodus/atoms'
import createInMemoryStorage from '@exodus/storage-memory'

import {
  featureFlagAtomsDefinition,
  featureFlagsAtomDefinition,
  remoteConfigFeatureFlagAtomsDefinition,
} from '../../../atoms/index.js'
import createRemoteConfigWithData from '../../../shared/__tests__/dummy-remote-config.js'
import featureFlagsModuleDefinition from '../../index.js'

const dummyGeolocationAtom = createInMemoryAtom({
  defaultValue: { countries: 'all' },
})

describe('example without dependency injection', () => {
  test('basic', (done) => {
    const logger = console
    const storage = createInMemoryStorage()
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

    const remoteConfigFeatureFlagAtoms = remoteConfigFeatureFlagAtomsDefinition.factory({
      config,
      remoteConfig,
    })

    const featureFlagAtoms = featureFlagAtomsDefinition.factory({ config, storage })
    const featureFlagsAtom = featureFlagsAtomDefinition.factory({ featureFlagAtoms })

    // eslint-disable-next-line no-unused-vars
    const featureFlags = featureFlagsModuleDefinition.factory({
      config,
      featureFlagAtoms,
      remoteConfigFeatureFlagAtoms,
      // dummy geolocation atom that enables all geolocation
      geolocationAtom: dummyGeolocationAtom,
      logger,
      getBuildMetadata: async () => ({ version: '1.2.3' }),
    })

    featureFlagsAtom.observe(() => {
      done()
    })
  })
})
