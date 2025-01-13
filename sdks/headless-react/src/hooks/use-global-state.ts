import { useCallback, useContext, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import HeadlessContext from '../context/index.js'
import { State } from '../types.js'
import { REDUX_SLICE_NAME } from '../constants/index.js'

type GlobalState = { [REDUX_SLICE_NAME]: State }

const useStorage = () => useContext(HeadlessContext).storage

interface GlobalStateOptions {
  namespace: string
  key: string
  persist?: boolean
  defaultValue: unknown
}

const useGlobalState = ({ namespace, key, persist, defaultValue }: GlobalStateOptions) => {
  const dispatch = useDispatch()
  const storage = useStorage()
  const valueRef = useRef()
  const value = useSelector(
    (state: GlobalState) => state[REDUX_SLICE_NAME][namespace]?.[key] ?? defaultValue
  )

  useEffect(() => {
    valueRef.current = value
  }, [value])

  const setValue = useCallback(
    (newValue) => {
      if (typeof newValue === 'function') newValue = newValue(valueRef.current)
      if (persist) storage?.set({ namespace, key, value: newValue })

      dispatch({ type: 'UI_SET', payload: { namespace, key, value: newValue } })
    },
    [persist, storage, namespace, key, dispatch]
  )

  return [value, setValue]
}

export default useGlobalState
