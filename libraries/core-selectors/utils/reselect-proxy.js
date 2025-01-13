import lodash from 'lodash'

// Intentionally imported by path, as we do not want it to change on reselect alias change when testing selectors
// eslint-disable-next-line import/no-unresolved
import * as reselect from '../../../reselect'

const { isEqual, throttle } = lodash

const logSelectorAfterMs = 3
const useDeepEqualSelectorWithLogs = false
const useSelectorWithLogs = true
const showCombinedTime = false
const combinedTimeShowTreshold = 40
const showCombinedTimeForAllSelectors = true

const throttledLog = throttle(console.log, 2000)
const throttledAllSelectorsLog = throttle(console.log, 10_000)

const times = { all: { time: 0, count: 0 } }
let index = 0

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

export const createSelector = (...func) => {
  let computationIndex = 0
  const useSelectorWithLogsLogger = {}

  const localIndex = ++index
  times[localIndex] = { time: 0, count: 0 }
  const originalResultFunc = func.pop()
  let t1
  let t2
  const resultFunc = (...args) => {
    t1 = new Date()
    const result = originalResultFunc(...args)
    t2 = new Date()
    return result
  }

  let selector = reselect.createSelectorCreator(reselect.defaultMemoize)(...func, resultFunc)
  if (useDeepEqualSelectorWithLogs) selector = createDeepEqualSelectorWithLogs(...func, resultFunc)
  if (useSelectorWithLogs)
    selector = createSelectorWithLogs([...func, resultFunc], (...args) => {
      useSelectorWithLogsLogger[computationIndex] =
        useSelectorWithLogsLogger[computationIndex] || []
      useSelectorWithLogsLogger[computationIndex].push(args)
    })

  return (...args) => {
    const out = selector(...args)
    if (t1 && t2) {
      times[localIndex].time += t2 - t1
      times[localIndex].count += 1
      times.all.time += t2 - t1
      times.all.count += 1
      if (t2 - t1 > logSelectorAfterMs) {
        const recomputeReasons = useSelectorWithLogsLogger[computationIndex]?.length
          ? ['\nReasons for re-compute: ', useSelectorWithLogsLogger[computationIndex]]
          : ''
        console.log(
          `Selector compute took ${t2 - t1}ms. Func:`,
          originalResultFunc.name,
          [originalResultFunc],
          ...recomputeReasons
        )

        delete useSelectorWithLogsLogger[computationIndex]
      }

      if (showCombinedTime && times[localIndex].time > combinedTimeShowTreshold)
        throttledLog(
          `Selector compute total is ${times[localIndex].time}ms in ${times[localIndex].count} invocations. Func:`,
          originalResultFunc.name,
          [originalResultFunc]
        )
      if (showCombinedTimeForAllSelectors)
        throttledAllSelectorsLog(
          `Selector compute total for all selectors is ${times.all.time}ms in ${times.all.count} invocations.`
        )

      computationIndex++

      t1 = undefined
      t2 = undefined
    }

    return out
  }
}

export const createSelectorCreator = reselect.createSelectorCreator
export const createStructuredSelector = reselect.createStructuredSelector
export const defaultMemoize = reselect.defaultMemoize
