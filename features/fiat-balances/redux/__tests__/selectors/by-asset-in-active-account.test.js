import { FIAT_BALANCES_PAYLOAD } from '../constants.js'
import { createFiatNumberUnit, setup } from '../utils.js'

describe('byAssetInActiveAccount', () => {
  it('should return fiat balances by asset in active account', () => {
    const { store, selectors, emitFiatBalances } = setup()
    const selector = selectors.fiatBalances.byAssetInActiveAccount

    emitFiatBalances(FIAT_BALANCES_PAYLOAD)

    expect(selector(store.getState())).toEqual({
      bitcoin: createFiatNumberUnit(40),
      ethereum: createFiatNumberUnit(20),
      algorand: createFiatNumberUnit(10),
      tetherusd_algorand: createFiatNumberUnit(10),
    })
  })
})
