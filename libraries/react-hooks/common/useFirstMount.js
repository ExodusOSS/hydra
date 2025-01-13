import { useRef } from 'react'

// return true it's first component mount
//
// ```
// const isFirstMount = useFirstMount()
// ```
const useFirstMount = () => {
  const isFirst = useRef(true)

  if (isFirst.current) {
    isFirst.current = false

    return true
  }

  return isFirst.current
}

export default useFirstMount
