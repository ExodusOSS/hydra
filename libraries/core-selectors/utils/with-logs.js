import { createSelectorCreator, defaultMemoize } from 'reselect'

export const createSelectorWithLogs = (funcs, logCallback) => {
  const createSelector = createSelectorCreator(defaultMemoize, (a, b) => {
    if (a === b) return true
    if (typeof logCallback === 'function') {
      logCallback(
        'Selector input ref was not equal, causing selector to re-compute. Inputs:',
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
