import { setup } from '../utils.js'

describe('language', () => {
  it('should return language', () => {
    const { store, selectors, emitLanguage } = setup()

    expect(selectors.locale.language(store.getState())).toEqual('en')

    emitLanguage('es')

    expect(selectors.locale.language(store.getState())).toEqual('es')
  })

  it('should become "loaded" on first language assignment', () => {
    const { store, selectors, emitLanguage } = setup()

    expect(selectors.locale.languageLoaded(store.getState())).toEqual(false)
    expect(selectors.locale.currencyLoaded(store.getState())).toEqual(false)

    emitLanguage('en')

    expect(selectors.locale.languageLoaded(store.getState())).toEqual(true)
    expect(selectors.locale.currencyLoaded(store.getState())).toEqual(false)
  })
})
