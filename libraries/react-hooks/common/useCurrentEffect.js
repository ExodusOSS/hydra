import { useEffect } from 'react'
// See: https://flufd.github.io/avoiding-race-conditions-use-current-effect
//
// ```javascript
// useCurrentEffect(isCurrent => {
//   api.searchOrders(customerId, searchParams).then(results => {
//     if (isCurrent()) {
//       setSearchResults(results)
//     }
//   })
// },[customerId])
// ```

const useCurrentEffect = (effectFn, deps = []) => {
  useEffect(() => {
    let isCurrent = true

    const checkCurrent = () => isCurrent

    const cleanupFn = effectFn(checkCurrent)

    return () => {
      isCurrent = false
      cleanupFn && cleanupFn()
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}

export default useCurrentEffect
