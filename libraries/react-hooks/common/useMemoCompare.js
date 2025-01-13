import lodash from 'lodash'
import { useRef } from 'react'

import usePrevious from './usePrevious.js'

const { isEqual } = lodash

// inspired by: https://usehooks.com/useMemoCompare/

/**
 * Similar to React.useMemo except it allows for custom/deep comparison of dependecies array.
 * @param {Function} evaluate - Function to run when `deps` changes to calculate the return value.
 * @param {[]} deps - The array of dependencies
 * @param {Function[]} [compareFuncs=[]] - Optional, used to supply custom comparison functions
 *   for dependencies. The function corresponding to a dependency will be at the same index
 *   in this array as the dependency is in the `deps` array. As such, dependencies with
 *   custom compare functions will come first, followed by functions that should use
 * @returns {any} result - Memoized version of the result of executing
 *   `evaluate` since the last time `deps` changed.
 */

export default function useMemoCompare(evaluate, deps, compareFuncs = []) {
  const previousDeps = usePrevious(deps)
  const returnValueRef = useRef()

  if (previousDeps) {
    // determine whether deps have changed
    for (const index of deps.keys()) {
      const func = compareFuncs[index] || isEqual
      if (!func(previousDeps[index], deps[index])) {
        returnValueRef.current = evaluate()
        break
      }
    }
  } else {
    // evaluate on the first run (usePrevious always returns undefined the first time)
    returnValueRef.current = evaluate()
  }

  return returnValueRef.current
}
