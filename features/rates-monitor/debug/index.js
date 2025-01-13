import assert from 'minimalistic-assert'
import { merge } from 'lodash'

const createRatesDebug = ({ ratesAtom }) => ({
  rates: {
    set: async ({ assetTicker, currency, price, priceUSD, change24, volume24, cap }) => {
      assert(currency, 'you must pass currency')
      assert(assetTicker, 'you must pass assetTicker')

      const currentData = await ratesAtom.get()
      const currencyData = currentData[currency]

      assert(currencyData, `${currency} rates not loaded. switch to it first.`)

      const newData = merge({}, currentData, {
        [currency]: { [assetTicker]: { price, priceUSD, change24, volume24, cap } },
      })

      await ratesAtom.set(newData)
    },
  },
})

const ratesDebugDefinition = {
  id: 'ratesDebugApi',
  type: 'api',
  factory: createRatesDebug,
  dependencies: ['ratesAtom'],
}

export default ratesDebugDefinition
