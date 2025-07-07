type Granularity = 'day' | 'hour' | 'minute'

declare const marketHistoryApiDefinition: {
  id: 'marketHistoryApi'
  type: 'api'
  factory(): {
    marketHistory: {
      update: (granularity: Granularity) => Promise<void>
      updateAll: () => Promise<void>
      fetchAssetPricesFromDate: ({
        assetName,
        granularity,
        startTimestamp,
      }: {
        assetName: string
        granularity: Granularity
        startTimestamp: number
      }) => Promise<void>
    }
  }
}

export default marketHistoryApiDefinition
