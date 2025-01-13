import EventEmitter from 'events/'
import remoteConfigDefinition from '@exodus/remote-config/lib/module'
import remoteConfigStatusAtomDefinition from '@exodus/remote-config/lib/atoms'

const createRemoteConfig = remoteConfigDefinition.factory
const createRemoteConfigStatusAtom = remoteConfigStatusAtomDefinition.factory

export default function createRemoteConfigWithData({ data }) {
  return createRemoteConfig({
    eventEmitter: new EventEmitter(),
    logger: console,
    fetch: async () => ({
      headers: {
        get: (field) => (field === 'Date' ? new Date('2022-01-01') : undefined),
      },
      json: async () => ({ data }),
    }),
    freeze: (obj) => obj,
    config: {
      remoteConfigUrl: '/',
      fetchInterval: 100,
      errorBackoffTime: 10_000,
    },
    remoteConfigStatusAtom: createRemoteConfigStatusAtom(),
  })
}
