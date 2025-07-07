import { FIAT_BALANCES_PAYLOAD } from '../constants.js'
import { createFiatNumberUnit, setup } from '../utils.js'

describe('byAsset', () => {
  it('should return fiat balances by asset', () => {
    const { store, selectors, emitFiatBalances } = setup()
    const selector = selectors.fiatBalances.byAsset

    expect(selector(store.getState())).toEqual({})

    emitFiatBalances(FIAT_BALANCES_PAYLOAD)

    expect(selector(store.getState())).toEqual({
      algorand: createFiatNumberUnit(15),
      bitcoin: createFiatNumberUnit(40),
      ethereum: createFiatNumberUnit(20),
      solana: createFiatNumberUnit(10),
      tetherusd_algorand: createFiatNumberUnit(15),
    })
  })
})
