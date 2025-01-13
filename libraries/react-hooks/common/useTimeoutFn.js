import { useCallback, useEffect, useRef } from 'react'

// From: https://github.com/streamich/react-use/blob/master/src/useTimeoutFn.ts
//
// ```javascript
// const [isReady, clear, set] = useTimeoutFn(callback, 1000)
// ```

const useTimeoutFn = (fn, ms = 0) => {
  const ready = useRef(false)
  const timeout = useRef()
  const callback = useRef(fn)

  const isReady = useCallback(() => ready.current, [])

  const set = useCallback(() => {
    ready.current = false
    timeout.current && clearTimeout(timeout.current)

    timeout.current = setTimeout(() => {
      ready.current = true
      callback.current()
    }, ms)
  }, [ms])

  const clear = useCallback(() => {
    ready.current = null
    timeout.current && clearTimeout(timeout.current)
  }, [])

  // update ref when function changes
  useEffect(() => {
    callback.current = fn
  }, [fn])

  // set on mount, clear on unmount
  useEffect(() => {
    set()

    return clear
  }, [clear, ms, set])

  return [isReady, clear, set]
}

export default useTimeoutFn
