import { setup } from '../utils.js'

describe('createFeeData', () => {
  it('should return undefined by default', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('assets', {
      assets: {
        bitcoin: { baseAsset: { name: 'bitcoin' } },
      },
    })

    expect(selectors.feeData.createData('bitcoin')(store.getState())).toEqual(undefined)
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

    expect(selectors.feeData.createData('bitcoin')(store.getState())).toEqual(undefined)
    expect(selectors.feeData.createData('ethereum')(store.getState())).toEqual({})
    expect(selectors.feeData.createData('erc20')(store.getState())).toEqual({})
  })
})
