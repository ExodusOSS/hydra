import { FIAT_BALANCES_PAYLOAD } from '../constants'
import { createFiatNumberUnit, setup } from '../utils'

describe('byBaseAssetSource', () => {
  it('should return fiat balances by base asset source', () => {
    const { store, selectors, emitFiatBalances } = setup()
    const selector = selectors.fiatBalances.byBaseAssetSource

    expect(selector(store.getState())).toEqual({})

    emitFiatBalances(FIAT_BALANCES_PAYLOAD)

    expect(selector(store.getState())).toEqual({
      exodus_0: {
        bitcoin: createFiatNumberUnit(40),
        ethereum: createFiatNumberUnit(20),
        algorand: createFiatNumberUnit(20),
      },
      exodus_1: {
        solana: createFiatNumberUnit(10),
        algorand: createFiatNumberUnit(10),
      },
    })
  })
})
