import { setup } from '../utils.js'

describe('getFeeData', () => {
  it('should return undefined by default', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('assets', {
      assets: {
        bitcoin: { baseAsset: { name: 'bitcoin' } },
      },
    })

    expect(selectors.feeData.getData(store.getState())('bitcoin')).toEqual(undefined)
  })

  it('should return current data after feeData', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('feeData', { ethereum: {} })
    handleEvent('assets', {
      assets: {
        bitcoin: { baseAsset: { name: 'bitcoin' } },
        ethereum: { baseAsset: { name: 'ethereum' } },
        erc20: { baseAsset: { name: 'ethereum' } },
      },
    })

    expect(selectors.feeData.getData(store.getState())('bitcoin')).toEqual(undefined)
    expect(selectors.feeData.getData(store.getState())('ethereum')).toEqual({})
    expect(selectors.feeData.getData(store.getState())('erc20')).toEqual({})
  })
})
