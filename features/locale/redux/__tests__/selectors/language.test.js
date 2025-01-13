import { setup } from '../utils'

describe('language', () => {
  it('should return language', () => {
    const { store, selectors, emitLanguage } = setup()

    expect(selectors.locale.language(store.getState())).toEqual('en')

    emitLanguage('es')

    expect(selectors.locale.language(store.getState())).toEqual('es')
  })
})
