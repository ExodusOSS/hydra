// Source: https://usehooks-ts.com/react-hook/use-unmount.

import { useEffect, useRef } from 'react'

/**
 * Custom hook that runs a cleanup function when the component is unmounted.
 */
function useUnmount(fn: () => void) {
  const fnRef = useRef(fn)

  fnRef.current = fn

  useEffect(
    () => () => {
      fnRef.current()
    },
    []
  )
}

export default useUnmount
