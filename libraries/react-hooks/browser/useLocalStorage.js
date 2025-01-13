import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'

const returnTrue = () => true

const useLocalStorage = ({
  key,
  initialValue,
  getIsRestoredValueValid = returnTrue,
  localStorage,
}) => {
  const _state = useSelector((state) => state.localStorage[key])

  const state = useMemo(() => {
    if (_state === undefined || !getIsRestoredValueValid(_state)) {
      return initialValue
    }

    return _state
  }, [_state, getIsRestoredValueValid, initialValue])

  const set = useCallback(
    (newState) => {
      try {
        if (newState === undefined) return
        localStorage.setItem(key, newState)
      } catch {}
    },
    [key, localStorage]
  )

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key)
    } catch {}
  }, [key, localStorage])

  return [state, set, remove]
}

export default useLocalStorage
