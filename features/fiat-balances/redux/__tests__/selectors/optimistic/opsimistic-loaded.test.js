import { FIAT_BALANCES_PAYLOAD, OPTIMISTIC_FIAT_BALANCES_PAYLOAD } from '../../constants'
import { setup } from '../../utils'

function mirrorTestCaseForOptimisticOnOff(testMessage, fn) {
  it(`${testMessage} [optimisticActivityEnabled: false]`, () => {
    const setupResult = setup({
      optimisticActivityEnabled: false,
    })

    fn(setupResult)
  })

  it(`${testMessage} [optimisticActivityEnabled: true]`, () => {
    const setupResult = setup({
      optimisticActivityEnabled: true,
    })

    fn(setupResult)
  })
}

describe('optimisticLoaded', () => {
  mirrorTestCaseForOptimisticOnOff('initially is not loaded', ({ store, selectors }) => {
    const selector = selectors.fiatBalances.optimisticLoaded

    expect(selector(store.getState())).toEqual(false)
  })

  mirrorTestCaseForOptimisticOnOff(
    'becomes loaded after fiatBalance update',
    ({ store, selectors, emitFiatBalances }) => {
      const selector = selectors.fiatBalances.optimisticLoaded

      emitFiatBalances(FIAT_BALANCES_PAYLOAD)

      expect(selector(store.getState())).toEqual(true)
    }
  )

  mirrorTestCaseForOptimisticOnOff(
    'becomes loaded after optimisticFiatBalances update',
    ({ store, selectors, emitOptimisticFiatBalances }) => {
      const selector = selectors.fiatBalances.optimisticLoaded

      emitOptimisticFiatBalances(OPTIMISTIC_FIAT_BALANCES_PAYLOAD)

      expect(selector(store.getState())).toEqual(true)
    }
  )

  mirrorTestCaseForOptimisticOnOff(
    'stays loaded after a fiatBalance and then optimisticFiatBalances update',
    ({ store, selectors, emitOptimisticFiatBalances, emitFiatBalances }) => {
      const selector = selectors.fiatBalances.optimisticLoaded

      emitFiatBalances(FIAT_BALANCES_PAYLOAD)
      emitOptimisticFiatBalances(OPTIMISTIC_FIAT_BALANCES_PAYLOAD)

      expect(selector(store.getState())).toEqual(true)
    }
  )

  mirrorTestCaseForOptimisticOnOff(
    'stays loaded after a optimisticFiatBalances and then fiatBalance update',
    ({ store, selectors, emitOptimisticFiatBalances, emitFiatBalances }) => {
      const selector = selectors.fiatBalances.optimisticLoaded

      emitOptimisticFiatBalances(OPTIMISTIC_FIAT_BALANCES_PAYLOAD)
      emitFiatBalances(FIAT_BALANCES_PAYLOAD)

      expect(selector(store.getState())).toEqual(true)
    }
  )
})
