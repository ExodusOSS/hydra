import { setup } from '../utils'

describe('currency', () => {
  it('should return currency', () => {
    const { store, selectors, emitCurrency } = setup()

    expect(selectors.locale.currency(store.getState())).toEqual('USD')

    emitCurrency('EUR')

    expect(selectors.locale.currency(store.getState())).toEqual('EUR')
  })
})
