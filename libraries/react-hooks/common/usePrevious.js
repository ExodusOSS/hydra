import { useEffect, useRef } from 'react'

// Source: https://usehooks.com/usePrevious.
//
// ```javascript
// const previousValue = usePrevious(value)
//
// const hasChanges = previousValue !== value
// ```
const usePrevious = (value) => {
  const ref = useRef()

  useEffect(() => {
    ref.current = value
  }, [value])

  // Return previous value (happens before update in useEffect above).
  return ref.current
}

export default usePrevious
