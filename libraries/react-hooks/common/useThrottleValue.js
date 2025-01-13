import { useEffect, useState, useRef } from 'react'

// https://usehooks.com/usethrottle/
//
// ```javascript
// const throttledValue = useThrottleValue(value, delay)
// ```
const useThrottleValue = (value, interval) => {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastUpdated = useRef(null)

  useEffect(() => {
    const now = Date.now()

    if (lastUpdated.current && now >= lastUpdated.current + interval) {
      lastUpdated.current = now
      setThrottledValue(value)
    } else {
      const id = setTimeout(() => {
        lastUpdated.current = now
        setThrottledValue(value)
      }, interval)

      return () => clearTimeout(id)
    }
  }, [value, interval])

  return throttledValue
}

export default useThrottleValue
