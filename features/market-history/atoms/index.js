import { createInMemoryAtom } from '@exodus/atoms'
import { createRemoteConfigAtomFactory } from '@exodus/remote-config-atoms'

export const marketHistoryAtomDefinition = {
  id: 'marketHistoryAtom',
  type: 'atom',
  factory: () => createInMemoryAtom(Object.create(null)),
  dependencies: [],
  public: true,
}

export const marketHistoryRefreshIntervalAtomDefinition = {
  id: 'marketHistoryRefreshIntervalAtom',
  type: 'atom',
  factory: ({ config, remoteConfig }) => createRemoteConfigAtomFactory({ remoteConfig })(config),
  dependencies: ['config', 'remoteConfig'],
  public: true,
}

export const marketHistoryClearCacheAtomDefinition = {
  id: 'marketHistoryClearCacheAtom',
  type: 'atom',
  factory: ({ config }) => createInMemoryAtom(config),
  dependencies: ['config'],
  public: true,
}

export const remoteConfigClearMarketHistoryCacheAtomDefinition = {
  id: 'remoteConfigClearMarketHistoryCacheAtom',
  type: 'atom',
  factory: ({ config, remoteConfig }) => createRemoteConfigAtomFactory({ remoteConfig })(config),
  dependencies: ['config', 'remoteConfig'],
  public: true,
}
