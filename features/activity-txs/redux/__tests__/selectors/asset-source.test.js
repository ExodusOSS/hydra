import { setup } from '../utils'

describe('data', () => {
  it('should return data', () => {
    const { store, selectors } = setup()

    expect(
      selectors.activityTxs.createAssetSourceSelector({
        walletAccount: 'exodus_0',
        assetName: 'bitcoin',
      })(store.getState())
    ).toEqual([])
  })

  it('should return data when loaded', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('activityTxs', { exodus_0: { bitcoin: [{ txId: '1' }] } })

    expect(
      selectors.activityTxs.createAssetSourceSelector({
        walletAccount: 'exodus_0',
        assetName: 'bitcoin',
      })(store.getState())
    ).toEqual([
      {
        txId: '1',
      },
    ])
  })
})
