import { FIAT_BALANCES_PAYLOAD, OPTIMISTIC_FIAT_BALANCES_PAYLOAD } from '../../constants.js'
import { createFiatNumberUnit, setup } from '../../utils.js'

describe('optimisticByAssetSource', () => {
  it('should return substituted optimistic fiat balances by asset source if not `optimisticActivityEnabled`', () => {
    const { store, selectors, emitFiatBalances } = setup({
      optimisticActivityEnabled: false,
    })
    const selector = selectors.fiatBalances.optimisticByAssetSource

    expect(selector(store.getState())).toEqual({})

    emitFiatBalances(FIAT_BALANCES_PAYLOAD)

    expect(selector(store.getState())).toEqual({
      exodus_0: {
        bitcoin: createFiatNumberUnit(40),
        ethereum: createFiatNumberUnit(20),
        algorand: createFiatNumberUnit(10),
        tetherusd_algorand: createFiatNumberUnit(10),
      },
      exodus_1: {
        solana: createFiatNumberUnit(10),
        algorand: createFiatNumberUnit(5),
        tetherusd_algorand: createFiatNumberUnit(5),
      },
    })
  })
  it('should return optimistic fiat balances by asset source if `optimisticActivityEnabled`', () => {
    const { store, selectors, emitFiatBalances, emitOptimisticFiatBalances } = setup({
      optimisticActivityEnabled: true,
    })
    const selector = selectors.fiatBalances.optimisticByAssetSource

    expect(selector(store.getState())).toEqual({})

    emitOptimisticFiatBalances(OPTIMISTIC_FIAT_BALANCES_PAYLOAD)
    emitFiatBalances(FIAT_BALANCES_PAYLOAD)

    expect(selector(store.getState())).toEqual({
      exodus_0: {
        bitcoin: createFiatNumberUnit(60),
        ethereum: createFiatNumberUnit(20),
        algorand: createFiatNumberUnit(10),
        tetherusd_algorand: createFiatNumberUnit(10),
      },
      exodus_1: {
        solana: createFiatNumberUnit(10),
        algorand: createFiatNumberUnit(5),
        tetherusd_algorand: createFiatNumberUnit(5),
      },
    })
  })
})
