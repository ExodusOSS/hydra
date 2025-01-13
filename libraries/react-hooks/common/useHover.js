import { useEffect, useState } from 'react'

// From https://usehooks.com/useHover/
const useHover = (ref, debounced = false) => {
  const [value, setValue] = useState(false)

  useEffect(() => {
    let timeoutRef

    const onMouseOver = () => {
      debounced && clearTimeout(timeoutRef)
      setValue(true)
    }

    const onMouseOut = () => {
      if (debounced) {
        timeoutRef = setTimeout(() => {
          setValue(false)
        })
      } else {
        setValue(false)
      }
    }

    if (ref && ref.current) {
      ref.current.addEventListener('mouseover', onMouseOver)
      ref.current.addEventListener('mouseout', onMouseOut)
    }

    const { current } = ref

    return () => {
      if (current) {
        current.removeEventListener('mouseover', onMouseOver)
        current.removeEventListener('mouseout', onMouseOut)
      }
    }
  }, [debounced, ref])

  return value
}

export default useHover
