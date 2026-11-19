import { createInMemoryAtom } from '@exodus/atoms'
import { createRemoteConfigAtomFactory } from '@exodus/remote-config-atoms'

import type { RemoteConfigType } from '@exodus/remote-config'
import type { Definition } from '@exodus/dependency-types'
import type { MarketHistoryState } from '../types.js'

export const marketHistoryAtomDefinition = {
  id: 'marketHistoryAtom',
  type: 'atom',
  // oxlint-disable-next-line @exodus/oxlint-plugin-hydra/in-memory-atom-default-value -- get() intentionally blocks until state is set
  factory: () => createInMemoryAtom<MarketHistoryState | undefined>(),
  dependencies: [],
  public: true,
} as const satisfies Definition

export const marketHistoryRefreshIntervalAtomDefinition = {
  id: 'marketHistoryRefreshIntervalAtom',
  type: 'atom',
  factory: ({
    config,
    remoteConfig,
  }: {
    config: { path: string; defaultValue: number | null }
    remoteConfig: RemoteConfigType
  }) => createRemoteConfigAtomFactory({ remoteConfig })(config),
  dependencies: ['config', 'remoteConfig'],
  public: true,
} as const satisfies Definition

export const marketHistoryClearCacheAtomDefinition = {
  id: 'marketHistoryClearCacheAtom',
  type: 'atom',
  factory: ({ config }: { config: { defaultValue: string | null } }) => createInMemoryAtom(config),
  dependencies: ['config'],
  public: true,
} as const satisfies Definition

export const remoteConfigClearMarketHistoryCacheAtomDefinition = {
  id: 'remoteConfigClearMarketHistoryCacheAtom',
  type: 'atom',
  factory: ({
    config,
    remoteConfig,
  }: {
    config: { path: string; defaultValue: string | null }
    remoteConfig: RemoteConfigType
  }) => createRemoteConfigAtomFactory({ remoteConfig })(config),
  dependencies: ['config', 'remoteConfig'],
  public: true,
} as const satisfies Definition
