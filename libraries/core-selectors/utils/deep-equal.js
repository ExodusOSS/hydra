// Intentionally imported by path, as we do not want it to change on reselect alias change when testing selectors
import lodash from 'lodash'

import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect'

const { isEqual } = lodash

// NOTE: This selector uses deep comparisons to compare inputs, so use with caution

// It is useful especially when account state changes a lot (like syncing monero), which unnecessarily
// triggers some selectors based on account state, resulting in redundant renders.
// E.g. each time a monero block is synced balances are recalculated and WalletRoot items rerendered,
// even if no balances change
export const createDeepEqualSelector = createSelectorCreator(defaultMemoize, (a, b) => {
  if (a === b) return true
  return isEqual(a, b)
})

// if selector output is deep equal - return same result. Useful for selectors which can be re-calculated but return same result (object or array for example)
export const createDeepEqualOutputSelector = (...args) => {
  const selector = createSelector(...args)
  return createDeepEqualSelector(selector, (result) => result)
}

export { createDeepEqualSelector as default }

export const createDeepEqualSelectorWithLogs = (...funcs) => {
  const createSelector = createSelectorCreator(defaultMemoize, (a, b) => {
    if (a === b) return true
    const inputsEqual = isEqual(a, b)
    if (inputsEqual) {
      console.log(
        'Selector input ref was not equal, but output was the same. Inputs:',
        a,
        b,
        '\nCreateSelector inputs:',
        funcs
      )
    }

    // returns false so it behaves the same as in prod - in prod createSelector only checks ===
    return false
  })
  return createSelector(...funcs)
}
