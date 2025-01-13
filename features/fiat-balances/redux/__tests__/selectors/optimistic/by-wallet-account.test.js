import { OPTIMISTIC_FIAT_BALANCES_PAYLOAD } from '../../constants'
import { createFiatNumberUnit, setup } from '../../utils'

describe('optimisticByWalletAccount', () => {
  it('should return optimistic fiat balances by wallet account', () => {
    const { store, selectors, emitOptimisticFiatBalances } = setup()
    const selector = selectors.fiatBalances.optimisticByWalletAccount

    expect(selector(store.getState())).toEqual({})

    emitOptimisticFiatBalances(OPTIMISTIC_FIAT_BALANCES_PAYLOAD)

    expect(selector(store.getState())).toEqual({
      exodus_0: createFiatNumberUnit(100),
      exodus_1: createFiatNumberUnit(20),
    })
  })
})
