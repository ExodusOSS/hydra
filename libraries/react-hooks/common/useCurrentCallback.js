import { useCallback, useEffect } from 'react'

// Use to prevent race-conditions in async operations, when you are not sure callback is same in exact moment as on start
//
// ```javascript
// const onSearchOrders = useCurrentCallback(
//   isCurrent => searchParams => {
//     api.searchOrders(customerId, searchParams).then(results => {
//       if (isCurrent()) {
//         setSearchResults(results)
//       }
//     })
//   },
//   [customerId]
// )
// ```

// See: https://flufd.github.io/avoiding-race-conditions-use-current-effect
// https://github.com/Flufd/use-current-effect/blob/master/src/useCurrentCallback.ts
const useCurrentCallback = (callbackFactory, deps) => {
  let isCurrent = true
  const currentCheck = () => isCurrent

  // useEffect clean up to react to the dependencies changing
  useEffect(
    () => () => {
      isCurrent = false // oxlint-disable-line react/exhaustive-deps
    },
    deps
  )

  // create the callback using the factory function, injecting the current check function
  return useCallback(callbackFactory(currentCheck), deps) // oxlint-disable-line react/exhaustive-deps
}

export default useCurrentCallback
