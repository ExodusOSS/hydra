import { useCallback, useEffect, useState } from 'react'

const useFocus = (ref, { autoFocus } = {}) => {
  const [focused, setFocused] = useState(!!autoFocus)

  const setFocus = useCallback(() => {
    ref.current && ref.current.focus()
  }, [ref])

  useEffect(() => {
    if (autoFocus) {
      setFocus()
    }
  }, [autoFocus, setFocus])

  useEffect(() => {
    const onFocus = () => setFocused(true)
    const onBlur = () => setFocused(false)

    if (ref && ref.current) {
      ref.current.addEventListener('focus', onFocus)
      ref.current.addEventListener('blur', onBlur)
    }

    const { current } = ref

    return () => {
      if (current) {
        current.removeEventListener('focus', onFocus)
        current.removeEventListener('blur', onBlur)
      }
    }
  }, [ref])

  return { focused, setFocus }
}

export default useFocus
