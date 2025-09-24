import { APP_PROCESS_INITIAL_STATE } from '../../../constants.js'
import { setup } from '../utils.js'

describe('appProcess', () => {
  test('selector', () => {
    const { selectors, store } = setup()

    expect(selectors.appProcess.data(store.getState())).toEqual(APP_PROCESS_INITIAL_STATE)
  })
})
