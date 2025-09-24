import { setup } from '../utils.js'

describe('appProcess', () => {
  test('isBackground selector', () => {
    const { selectors, store } = setup()

    expect(selectors.appProcess.isBackground(store.getState())).toEqual(false)
  })
})
