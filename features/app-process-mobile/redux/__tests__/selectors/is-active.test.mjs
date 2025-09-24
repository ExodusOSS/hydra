import { setup } from '../utils.js'

describe('appProcess', () => {
  test('isActive selector', () => {
    const { selectors, store } = setup()

    expect(selectors.appProcess.isActive(store.getState())).toEqual(true)
  })
})
