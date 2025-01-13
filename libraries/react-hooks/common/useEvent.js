import { useLayoutEffect, useMemo, useRef } from 'react'

// read this before use https://github.com/reactjs/rfcs/blob/d85e257502a43c08d17e8ab58efa0880f7f007a5/text/0000-useevent.md#when-useevent-should-not-be-used
const useEvent = (fn) => {
  const ref = useRef(fn)
  useLayoutEffect(() => {
    ref.current = fn
  })
  return useMemo(
    () =>
      (...args) => {
        const { current } = ref
        return current(...args)
      },
    []
  )
}

export default useEvent
