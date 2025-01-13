import initialState from '../initial-state.js'
import { setup } from './utils.js'

const assets = {
  bitcoin: {
    name: 'bitcoin',
    icon: 'oldIcon',
  },
  ethereum: {
    name: 'ethereum',
  },
}

describe('eventReducers', () => {
  let store, emitAssets, handleEvent
  beforeEach(() => {
    ;({ store, emitAssets, handleEvent } = setup())
  })

  test('assets', () => {
    emitAssets({ ethereum: assets.ethereum, bitcoin: assets.bitcoin })

    expect(store.getState().assets).toEqual({
      ...initialState,
      loaded: true,
      error: null,
      data: assets,
    })
  })

  test('multiAddressMode', () => {
    handleEvent('multiAddressMode', { bitcoin: true })
    expect(store.getState().assets.multiAddressMode).toEqual({
      bitcoin: true,
    })
  })

  test('disabledPurposes', () => {
    handleEvent('disabledPurposes', { bitcoin: [86] })
    expect(store.getState().assets.disabledPurposes).toEqual({
      bitcoin: [86],
    })
  })
})
