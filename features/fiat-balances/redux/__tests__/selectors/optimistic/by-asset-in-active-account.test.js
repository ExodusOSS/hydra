import { OPTIMISTIC_FIAT_BALANCES_PAYLOAD } from '../../constants'
import { createFiatNumberUnit, setup } from '../../utils'

describe('optimisticByAssetInActiveAccount', () => {
  it('should return optimistic fiat balances by asset in active account', () => {
    const { store, selectors, emitOptimisticFiatBalances } = setup()
    const selector = selectors.fiatBalances.optimisticByAssetInActiveAccount

    emitOptimisticFiatBalances(OPTIMISTIC_FIAT_BALANCES_PAYLOAD)

    expect(selector(store.getState())).toEqual({
      bitcoin: createFiatNumberUnit(60),
      ethereum: createFiatNumberUnit(20),
      algorand: createFiatNumberUnit(10),
      tetherusd_algorand: createFiatNumberUnit(10),
    })
  })
})
