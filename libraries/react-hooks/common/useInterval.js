import { useEffect, useRef } from 'react'

// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
//
// ```javascript
// useInterval(callback, 1000)
// ```

const useInterval = function useInterval(callback, delay) {
  const savedCallback = useRef()
  const savedIntervalId = useRef()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    // clear previous interval, if it exists
    if (savedIntervalId.current) clearInterval(savedIntervalId.current)

    function tick() {
      savedCallback.current()
    }

    if (delay !== null) {
      // set new interval
      const id = setInterval(tick, delay)

      // store id, to be cleared if `delay` changes or on unmount
      savedIntervalId.current = id
      return () => clearInterval(id)
    }
  }, [delay])
}

export default useInterval
