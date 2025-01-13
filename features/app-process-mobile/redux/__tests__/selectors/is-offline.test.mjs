import { setup } from '../utils'

describe('appProcess', () => {
  test('isOffline selector', () => {
    const { selectors, store } = setup()

    expect(selectors.appProcess.isOffline(store.getState())).toEqual(false)
  })
})
