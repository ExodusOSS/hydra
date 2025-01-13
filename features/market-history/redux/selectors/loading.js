import { createSelector } from 'reselect'

export const dailyMarketHistoryIsLoadingSelector = {
  id: 'dailyLoading',
  selectorFactory: (dataSelector, loadedSelector) =>
    createSelector(
      dataSelector,
      loadedSelector,
      (data, loaded) => !loaded || Object.values(data).some((prices) => !prices.daily)
    ),
  dependencies: [
    //
    { selector: 'data' },
    { selector: 'loaded' },
  ],
}

export const hourlyMarketHistoryIsLoadingSelector = {
  id: 'hourlyLoading',
  selectorFactory: (dataSelector, loadedSelector) =>
    createSelector(
      dataSelector,
      loadedSelector,
      (data, loaded) => !loaded || Object.values(data).some((prices) => !prices.hourly)
    ),
  dependencies: [
    //
    { selector: 'data' },
    { selector: 'loaded' },
  ],
}

const marketHistoryLoadingSelector = {
  id: 'loadingMap',
  selectorFactory: (dailyMarketHistoryIsLoadingSelector, hourlyMarketHistoryIsLoadingSelector) =>
    createSelector(
      dailyMarketHistoryIsLoadingSelector,
      hourlyMarketHistoryIsLoadingSelector,
      (dailyLoading, hourlyLoading) => {
        return {
          dailyLoading,
          hourlyLoading,
        }
      }
    ),
  dependencies: [
    //
    { selector: 'dailyLoading' },
    { selector: 'hourlyLoading' },
  ],
}

export default marketHistoryLoadingSelector
