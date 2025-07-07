import { OPTIMISTIC_FIAT_BALANCES_PAYLOAD } from '../../constants.js'
import { createFiatNumberUnit, setup } from '../../utils.js'

describe('optimisticByBaseAssetInActiveAccount', () => {
  it('should return optimistic fiat balances by base asset source in active account', () => {
    const { store, selectors, emitOptimisticFiatBalances } = setup()
    const selector = selectors.fiatBalances.optimisticByBaseAssetInActiveAccount

    emitOptimisticFiatBalances(OPTIMISTIC_FIAT_BALANCES_PAYLOAD)

    expect(selector(store.getState())).toEqual({
      bitcoin: createFiatNumberUnit(40),
      ethereum: createFiatNumberUnit(20),
      algorand: createFiatNumberUnit(20),
    })
  })
})
