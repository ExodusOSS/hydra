import fiat from '@exodus/fiat-currencies'

import { setup } from '../utils.js'

describe('currencyUnitTypeSelector', () => {
  it('should return fiat', () => {
    const { store, selectors, emitCurrency } = setup()

    expect(selectors.locale.currencyUnitType(store.getState())).toEqual(fiat.USD)

    emitCurrency('EUR')

    expect(selectors.locale.currencyUnitType(store.getState())).toEqual(fiat.EUR)
  })
})
