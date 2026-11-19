import { safeString } from '@exodus/safe-string'

import type { Feature } from '@exodus/dependency-types'

import {
  marketHistoryAtomDefinition,
  marketHistoryClearCacheAtomDefinition,
  marketHistoryRefreshIntervalAtomDefinition,
  remoteConfigClearMarketHistoryCacheAtomDefinition,
} from './atoms/index.js'
import marketHistoryMonitorDefinition from './module/index.js'
import marketHistoryPluginDefinition from './plugin/index.js'
import marketHistoryApiDefinition from './api/index.js'
import {
  DEFAULT_DAILY_REQUEST_LIMIT,
  DEFAULT_HOURLY_REQUEST_LIMIT,
  DEFAULT_MINUTELY_REQUEST_LIMIT,
} from './constants.js'

const CLEAR_MARKET_HISTORY_VERSION = 'infrastructure.marketHistory.clearVersion'
const REFRESH_INTERVAL_ATOM_PATH = 'infrastructure.marketHistory.refreshInterval'

type MarketHistoryConfig = {
  clearHistoryCacheDefaultValue?: string | null
  remoteConfigClearHistoryCachePath?: string
  remoteConfigClearHistoryCacheDefaultValue?: string | null
  marketHistoryRefreshIntervalPath?: string
  marketHistoryRefreshIntervalDefaultValue?: number | null
  dailyRequestLimit?: number
  hourlyRequestLimit?: number
  minutelyRequestLimit?: number
}

const marketHistory = (
  {
    clearHistoryCacheDefaultValue = null,
    remoteConfigClearHistoryCachePath = CLEAR_MARKET_HISTORY_VERSION,
    remoteConfigClearHistoryCacheDefaultValue = null,
    marketHistoryRefreshIntervalPath = REFRESH_INTERVAL_ATOM_PATH,
    marketHistoryRefreshIntervalDefaultValue = null,
    dailyRequestLimit = DEFAULT_DAILY_REQUEST_LIMIT,
    hourlyRequestLimit = DEFAULT_HOURLY_REQUEST_LIMIT,
    minutelyRequestLimit = DEFAULT_MINUTELY_REQUEST_LIMIT,
  }: MarketHistoryConfig = Object.create(null)
) => {
  return {
    id: safeString`marketHistory`,
    definitions: [
      {
        definition: { ...marketHistoryMonitorDefinition, type: 'monitor' as const },
        storage: { namespace: 'marketHistory' },
        aliases: [
          {
            implementationId: 'unsafeStorage',
            interfaceId: 'storage',
          },
          {
            implementationId: 'marketHistoryClearCacheAtom',
            interfaceId: 'clearCacheAtom',
          },
          {
            implementationId: 'remoteConfigClearMarketHistoryCacheAtom',
            interfaceId: 'remoteConfigClearCacheAtom',
          },
          {
            implementationId: 'marketHistoryRefreshIntervalAtom',
            interfaceId: 'remoteConfigRefreshIntervalAtom',
          },
        ],
        config: {
          granularityRequestLimits: {
            day: dailyRequestLimit,
            hour: hourlyRequestLimit,
            minute: minutelyRequestLimit,
          },
        },
      },
      {
        definition: marketHistoryClearCacheAtomDefinition,
        config: {
          defaultValue: clearHistoryCacheDefaultValue,
        },
      },
      {
        definition: remoteConfigClearMarketHistoryCacheAtomDefinition,
        config: {
          path: remoteConfigClearHistoryCachePath,
          defaultValue: remoteConfigClearHistoryCacheDefaultValue,
        },
      },
      {
        definition: marketHistoryRefreshIntervalAtomDefinition,
        config: {
          path: marketHistoryRefreshIntervalPath,
          defaultValue: marketHistoryRefreshIntervalDefaultValue,
        },
      },
      { definition: marketHistoryPluginDefinition },
      { definition: marketHistoryAtomDefinition },
      { definition: marketHistoryApiDefinition },
    ],
  } satisfies Feature
}

export default marketHistory
