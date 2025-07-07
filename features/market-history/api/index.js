const createMarketHistoryApi = ({ marketHistoryMonitor }) => {
  return {
    marketHistory: {
      update: marketHistoryMonitor.update,
      updateAll: marketHistoryMonitor.updateAll,
      fetchAssetPricesFromDate: marketHistoryMonitor.fetchAssetPricesFromDate,
    },
  }
}

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'marketHistoryApi',
  type: 'api',
  factory: createMarketHistoryApi,
  dependencies: ['marketHistoryMonitor'],
}
