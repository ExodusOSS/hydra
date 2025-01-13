import { useEffect } from 'react'

import useFirstMount from './useFirstMount.js'

// useEffect that skips first mount
//
// ```javascript
// useUpdateEffect(callback, deps)
// ```

const useUpdateEffect = (effect, deps) => {
  const isFirstMount = useFirstMount()

  useEffect(() => {
    if (!isFirstMount) {
      return effect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export default useUpdateEffect
