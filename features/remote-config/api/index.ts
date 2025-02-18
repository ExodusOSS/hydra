import type { RemoteConfigType } from '../types/index.js'
import type { Definition } from '@exodus/dependency-types'

const createRemoteConfigApi = ({ remoteConfig }: { remoteConfig: RemoteConfigType }) => ({
  remoteConfig: {
    get: remoteConfig.get,
    getAll: remoteConfig.getAll,
    update: remoteConfig.update,
  },
})

const remoteConfigApiDefinition = {
  id: 'remoteConfigApi',
  type: 'api',
  factory: createRemoteConfigApi,
  dependencies: ['remoteConfig'],
} as const satisfies Definition

export default remoteConfigApiDefinition
