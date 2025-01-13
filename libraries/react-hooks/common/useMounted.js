import { useEffect, useRef } from 'react'

// Use to get actual mounted state of component
//
// ```javascript
// const isMounted = useMounted()
// ```

export default function useMounted() {
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])

  return mounted
}
