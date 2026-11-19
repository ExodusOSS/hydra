import assert from 'minimalistic-assert'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

import type { Atom } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'

import type { RatesByCurrency } from '../redux/types.js'

const { merge } = lodash

const createRatesDebug = ({ ratesAtom }: { ratesAtom: Atom<RatesByCurrency> }) => ({
  rates: {
    set: async ({
      assetTicker,
      currency,
      price,
      priceUSD,
      change24,
      volume24,
      cap,
    }: {
      assetTicker: string
      currency: string
      price?: number
      priceUSD?: number
      change24?: number
      volume24?: number
      cap?: number
    }) => {
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
  type: 'debug',
  factory: createRatesDebug,
  dependencies: ['ratesAtom'],
} as const satisfies Definition

export default ratesDebugDefinition
