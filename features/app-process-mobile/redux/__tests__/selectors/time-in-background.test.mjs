import { setup } from '../utils.js'

describe('appProcess', () => {
  test('timeInBackground selector', () => {
    const { selectors, store } = setup()

    expect(selectors.appProcess.timeInBackground(store.getState())).toEqual(0)
  })
})
