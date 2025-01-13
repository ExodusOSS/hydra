import { useCallback, useEffect, useRef } from 'react'

// Returns debounced callback function
export default function useDebouncedCallback(callback, wait) {
  const argsRef = useRef()
  const timeout = useRef()

  function cleanup() {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }
  }

  useEffect(() => cleanup, [])

  return useCallback(
    function debouncedCallback(...args) {
      argsRef.current = args
      cleanup()
      timeout.current = setTimeout(() => {
        if (argsRef.current) {
          callback(...argsRef.current)
        }
      }, wait)
    },
    [callback, wait]
  )
}
