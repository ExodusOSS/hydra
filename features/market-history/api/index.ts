import type { Definition } from '@exodus/dependency-types'
import type { MarketHistoryMonitor } from '../types.js'

const createMarketHistoryApi = ({
  marketHistoryMonitor,
}: {
  marketHistoryMonitor: MarketHistoryMonitor
}) => {
  return {
    marketHistory: {
      update: marketHistoryMonitor.update,
      updateAll: marketHistoryMonitor.updateAll,
      fetchAssets: marketHistoryMonitor.fetchAssets,
      fetchAssetPricesFromDate: marketHistoryMonitor.fetchAssetPricesFromDate,
    },
  }
}

const marketHistoryApiDefinition = {
  id: 'marketHistoryApi',
  type: 'api',
  factory: createMarketHistoryApi,
  dependencies: ['marketHistoryMonitor'],
} as const satisfies Definition

export default marketHistoryApiDefinition
