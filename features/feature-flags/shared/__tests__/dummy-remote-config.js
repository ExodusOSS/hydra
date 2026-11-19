import remoteConfig from '@exodus/remote-config'

const remoteConfigDefinition = remoteConfig().definitions.find(
  ({ definition }) => definition.id === 'remoteConfig'
).definition

const createRemoteConfig = remoteConfigDefinition.factory

export default function createRemoteConfigWithData({ data, remoteConfigAtom }) {
  return createRemoteConfig({
    logger: console,
    fetch: async () => ({
      ok: true,
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
    remoteConfigAtom,
  })
}
