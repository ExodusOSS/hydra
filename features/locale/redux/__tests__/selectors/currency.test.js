import { setup } from '../utils.js'

describe('currency', () => {
  it('should return currency', () => {
    const { store, selectors, emitCurrency } = setup()

    expect(selectors.locale.currency(store.getState())).toEqual('USD')

    emitCurrency('EUR')

    expect(selectors.locale.currency(store.getState())).toEqual('EUR')
  })

  it('should become "loaded" on first currency assignment', () => {
    const { store, selectors, emitCurrency } = setup()

    expect(selectors.locale.currencyLoaded(store.getState())).toEqual(false)
    expect(selectors.locale.languageLoaded(store.getState())).toEqual(false)

    emitCurrency('USD')

    expect(selectors.locale.currencyLoaded(store.getState())).toEqual(true)
    expect(selectors.locale.languageLoaded(store.getState())).toEqual(false)
  })
})
