import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

import type { PriceTimeType } from '../../types.js'

const getFiatValueWithFallbackSelector = {
  id: 'getFiatValueWithFallback',
  resultFunction: (
    getPriceWithFallback: (assetName: string, time: number, type: PriceTimeType) => number | null
  ) => {
    return ({
      assetName,
      time,
      type,
      amount,
    }: {
      assetName: string
      time: number
      type: PriceTimeType
      amount: number
    }) => {
      if (!amount) return 0
      const price = getPriceWithFallback(assetName, time, type)
      if (!price) return 0
      return price * amount
    }
  },
  dependencies: [
    //
    { selector: 'getPriceWithFallback' },
  ],
} as const satisfies SelectorDefinition

export default getFiatValueWithFallbackSelector
