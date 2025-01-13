import { setup } from '../utils'
import { APP_PROCESS_INITIAL_STATE } from '../../../constants'

describe('appProcess', () => {
  test('selector', () => {
    const { selectors, store } = setup()

    expect(selectors.appProcess.data(store.getState())).toEqual(APP_PROCESS_INITIAL_STATE)
  })
})
