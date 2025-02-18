import { APP_PROCESS_INITIAL_STATE } from '../../../constants'
import { setup } from '../utils'

describe('appProcess', () => {
  test('selector', () => {
    const { selectors, store } = setup()

    expect(selectors.appProcess.data(store.getState())).toEqual(APP_PROCESS_INITIAL_STATE)
  })
})
