import {
  marketHistoryAtomDefinition,
  marketHistoryClearCacheAtomDefinition,
  marketHistoryRefreshIntervalAtomDefinition,
  remoteConfigClearMarketHistoryCacheAtomDefinition,
} from './atoms/index.js'
import marketHistoryMonitorDefinition from './module/index.js'

import marketHistoryPluginDefinition from './plugin/index.js'
import marketHistoryApiDefinition from './api/index.js'

const CLEAR_MARKET_HISTORY_VERSION = 'infrastructure.marketHistory.clearVersion'
const REFRESH_INTERVAL_ATOM_PATH = 'infrastructure.marketHistory.refreshInterval'
const DEFAULT_DAILY_REQUEST_LIMIT = 366
const DEFAULT_HOURLY_REQUEST_LIMIT = 7 * 24
const DEFAULT_MINUTELY_REQUEST_LIMIT = 2 * 60

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
  } = Object.create(null)
) => {
  return {
    id: 'marketHistory',
    definitions: [
      {
        definition: { type: 'monitor', ...marketHistoryMonitorDefinition },
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
  }
}

export default marketHistory
