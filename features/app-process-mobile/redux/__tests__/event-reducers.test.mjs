import { APP_PROCESS_INITIAL_STATE } from '../../constants.js'
import { setup } from './utils.js'

describe('appProcess eventReducers', () => {
  test('appProcess merges payload into the existing slice state', () => {
    const { createHandleEvent, store } = setup()
    const handleEvent = createHandleEvent(store)

    handleEvent('appProcess', { mode: 'background', networkType: 'wifi' })

    expect(store.getState().appProcess).toEqual({
      ...APP_PROCESS_INITIAL_STATE,
      mode: 'background',
      networkType: 'wifi',
    })
  })

  test('appProcess preserves untouched fields across multiple events', () => {
    const { createHandleEvent, store } = setup()
    const handleEvent = createHandleEvent(store)

    handleEvent('appProcess', { networkType: 'wifi' })
    handleEvent('appProcess', { mode: 'background' })

    const state = store.getState().appProcess
    expect(state.networkType).toBe('wifi')
    expect(state.mode).toBe('background')
    expect(state.startTime).toBe(APP_PROCESS_INITIAL_STATE.startTime)
  })
})
