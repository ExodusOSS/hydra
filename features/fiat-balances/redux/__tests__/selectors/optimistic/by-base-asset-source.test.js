import { OPTIMISTIC_FIAT_BALANCES_PAYLOAD } from '../../constants'
import { createFiatNumberUnit, setup } from '../../utils'

describe('optimisticByBaseAssetSource', () => {
  it('should return optimistic fiat balances by base asset source', () => {
    const { store, selectors, emitOptimisticFiatBalances } = setup()
    const selector = selectors.fiatBalances.optimisticByBaseAssetSource

    expect(selector(store.getState())).toEqual({})

    emitOptimisticFiatBalances(OPTIMISTIC_FIAT_BALANCES_PAYLOAD)

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
