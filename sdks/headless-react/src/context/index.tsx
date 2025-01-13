import React, { useEffect, useMemo, useRef } from 'react'
import { useStore } from 'react-redux'
import { Storage } from '@exodus/storage-interface'

import createUiStorage from './storage.js'

type ExodusApi = unknown // TODO: Reuse ExodusApi

type Selectors = Record<string, unknown> // TODO: Reuse Selectors type

type HeadlessContextValue = {
  exodus: ExodusApi
  selectors: Selectors
  storage?: ReturnType<typeof createUiStorage>
}

const initialValue = {
  exodus: {},
  selectors: {},
  storage: undefined,
}

const HeadlessContext = React.createContext<HeadlessContextValue>(initialValue)

interface HeadlessProviderProps {
  exodus: ExodusApi
  selectors: Selectors
  adapters: { storage: Storage<any, any> }
  children: React.ReactNode
}

export const HeadlessProvider = ({
  exodus,
  adapters,
  selectors,
  children,
}: HeadlessProviderProps) => {
  const store = useStore()

  if (!store) {
    throw new Error('HeadlessProvider must be a descendant of a Redux <Provider> component')
  }

  const storage = useRef(createUiStorage(adapters.storage))

  // Load stored state on mount
  useEffect(() => {
    storage.current?.get().then((state) => store.dispatch({ type: 'UI_LOAD', payload: state }))
  }, [store])

  const value = useMemo(
    () => ({ exodus, selectors, storage: storage.current }),
    [exodus, selectors]
  )

  return <HeadlessContext.Provider value={value}>{children}</HeadlessContext.Provider>
}

export default HeadlessContext
