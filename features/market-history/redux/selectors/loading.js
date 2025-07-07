import { createSelector } from 'reselect'

const hasNoMarketHistoryData = (data, granularityKey) =>
  Object.keys(data).length === 0 ||
  Object.values(data).some(
    (prices) => !prices[granularityKey] || Object.keys(prices[granularityKey]).length === 0
  )

export const dailyMarketHistoryIsLoadingSelector = {
  id: 'dailyLoading',
  selectorFactory: (dataSelector) =>
    createSelector(dataSelector, (data) => hasNoMarketHistoryData(data, 'daily')),
  dependencies: [
    //
    { selector: 'data' },
  ],
}

export const hourlyMarketHistoryIsLoadingSelector = {
  id: 'hourlyLoading',
  selectorFactory: (dataSelector) =>
    createSelector(dataSelector, (data) => hasNoMarketHistoryData(data, 'hourly')),
  dependencies: [
    //
    { selector: 'data' },
  ],
}

export const minutelyMarketHistoryIsLoadingSelector = {
  id: 'minutelyLoading',
  selectorFactory: (dataSelector) =>
    createSelector(dataSelector, (data) => hasNoMarketHistoryData(data, 'minutely')),
  dependencies: [
    //
    { selector: 'data' },
  ],
}

const marketHistoryLoadingSelector = {
  id: 'loadingMap',
  selectorFactory: (
    dailyMarketHistoryIsLoadingSelector,
    hourlyMarketHistoryIsLoadingSelector,
    minutelyMarketHistoryIsLoadingSelector
  ) =>
    createSelector(
      dailyMarketHistoryIsLoadingSelector,
      hourlyMarketHistoryIsLoadingSelector,
      minutelyMarketHistoryIsLoadingSelector,
      (dailyLoading, hourlyLoading, minutelyLoading) => {
        return {
          dailyLoading,
          hourlyLoading,
          minutelyLoading,
        }
      }
    ),
  dependencies: [
    //
    { selector: 'dailyLoading' },
    { selector: 'hourlyLoading' },
    { selector: 'minutelyLoading' },
  ],
}

export default marketHistoryLoadingSelector
