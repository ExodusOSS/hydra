import { setup } from '../utils.js'

describe('feeData', () => {
  it('should return empty object by default', () => {
    const { store, selectors } = setup()

    expect(selectors.feeData.data(store.getState())).toEqual({})
  })

  it('should return current data after feeData', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('feeData', { bitcoin: {} })

    expect(selectors.feeData.data(store.getState())).toEqual({ bitcoin: {} })
  })

  it('should return current data after feeData', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('feeData', { bitcoin: {}, ethereum: {} })

    expect(selectors.feeData.data(store.getState())).toEqual({ bitcoin: {}, ethereum: {} })
  })
})
