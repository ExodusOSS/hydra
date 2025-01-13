import { useEffect, useState } from 'react'

import useCurrentCallback from './useCurrentCallback.js'
import useMounted from './useMounted.js'

// Use to handle any async loading process
//
// ```javascript
// const { value, loading, error } = useAsync(() => fetch('something'), [])
// ```

const useAsync = (fn, deps = [], immediate = true) => {
  const isMounted = useMounted()

  const [state, setState] = useState({ loading: immediate })

  const callback = useCurrentCallback(
    (isCurrent) => () => {
      setState((prevState) => ({ ...prevState, loading: true }))

      return fn().then(
        (value) => {
          if (isCurrent() && isMounted.current) {
            setState({ value, loading: false })
          }

          return value
        },
        (error) => {
          if (isCurrent() && isMounted.current) {
            setState({ error, loading: false })
          }

          return error
        }
      )
    },
    deps
  )

  useEffect(() => {
    immediate && callback()
  }, [callback, immediate])

  return { ...state, execute: callback }
}

export default useAsync
