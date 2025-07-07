import loadFixture from '../../../test/load-fixture.cjs'
import { setup } from '../utils.js'

const fixtures = loadFixture('tx-log-fixtures')

describe('data', () => {
  it('should return data', () => {
    const { store, selectors } = setup()

    expect(
      selectors.activityTxs.createLimitedAssetSourceSelector({
        walletAccount: 'exodus_0',
        assetName: 'bitcoin',
        limit: 1,
      })(store.getState())
    ).toEqual([])
  })

  it('should return data when loaded', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('activityTxs', {
      exodus_0: { bitcoin: fixtures.bitcoin },
    })

    expect(
      selectors.activityTxs.createLimitedAssetSourceSelector({
        walletAccount: 'exodus_0',
        assetName: 'bitcoin',
        limit: 1,
      })(store.getState()).length
    ).toEqual(1)
  })
})
