import { createSelector } from 'reselect'
import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

import type { BooleanSelector, DataSelector, MarketHistoryData } from '../../types.js'

const hasNoMarketHistoryData = (data: MarketHistoryData, granularityKey: string): boolean =>
  Object.keys(data).length === 0 ||
  Object.values(data).some(
    (prices) =>
      !prices[granularityKey as keyof typeof prices] ||
      Object.keys(prices[granularityKey as keyof typeof prices]!).length === 0
  )

export const dailyMarketHistoryIsLoadingSelector = {
  id: 'dailyLoading',
  selectorFactory: (dataSelector: DataSelector) =>
    createSelector(dataSelector, (data: MarketHistoryData) =>
      hasNoMarketHistoryData(data, 'daily')
    ),
  dependencies: [
    //
    { selector: 'data' },
  ],
} as const satisfies SelectorDefinition

export const hourlyMarketHistoryIsLoadingSelector = {
  id: 'hourlyLoading',
  selectorFactory: (dataSelector: DataSelector) =>
    createSelector(dataSelector, (data: MarketHistoryData) =>
      hasNoMarketHistoryData(data, 'hourly')
    ),
  dependencies: [
    //
    { selector: 'data' },
  ],
} as const satisfies SelectorDefinition

export const minutelyMarketHistoryIsLoadingSelector = {
  id: 'minutelyLoading',
  selectorFactory: (dataSelector: DataSelector) =>
    createSelector(dataSelector, (data: MarketHistoryData) =>
      hasNoMarketHistoryData(data, 'minutely')
    ),
  dependencies: [
    //
    { selector: 'data' },
  ],
} as const satisfies SelectorDefinition

const marketHistoryLoadingSelector = {
  id: 'loadingMap',
  selectorFactory: (
    dailyMarketHistoryIsLoadingSelector: BooleanSelector,
    hourlyMarketHistoryIsLoadingSelector: BooleanSelector,
    minutelyMarketHistoryIsLoadingSelector: BooleanSelector
  ) =>
    createSelector(
      dailyMarketHistoryIsLoadingSelector,
      hourlyMarketHistoryIsLoadingSelector,
      minutelyMarketHistoryIsLoadingSelector,
      (dailyLoading: boolean, hourlyLoading: boolean, minutelyLoading: boolean) => {
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
} as const satisfies SelectorDefinition

export default marketHistoryLoadingSelector
