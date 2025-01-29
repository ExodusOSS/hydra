// Source: https://usehooks-ts.com/react-hook/use-debounce-callback.

import lodash from 'lodash'
import { useEffect, useMemo, useRef } from 'react'

import useUnmount from './use-unmount.js'

const { debounce } = lodash

type DebounceOptions = {
  leading?: boolean
  trailing?: boolean
  maxWait?: number
}

type ControlFunctions = {
  cancel: () => void
  flush: () => void
  isPending: () => boolean
}

export type DebouncedState<T extends (...args: any) => ReturnType<T>> = ((
  ...args: Parameters<T>
) => ReturnType<T> | undefined) &
  ControlFunctions

/**
 * Custom hook that creates a debounced version of a callback function.
 */
function useDebounceCallback<T extends (...args: any) => ReturnType<T>>(
  fn: T,
  delay = 500,
  options?: DebounceOptions
): DebouncedState<T> {
  const debouncedFn = useRef<ReturnType<typeof debounce>>()

  useUnmount(() => {
    if (debouncedFn.current) {
      debouncedFn.current.cancel()
    }
  })

  const debounced = useMemo(() => {
    const debouncedFnInstance = debounce(fn, delay, options)

    const wrappedFn: DebouncedState<T> = (...args: Parameters<T>) => {
      return debouncedFnInstance(...args)
    }

    wrappedFn.cancel = () => {
      debouncedFnInstance.cancel()
    }

    wrappedFn.isPending = () => {
      return !!debouncedFn.current
    }

    wrappedFn.flush = () => {
      return debouncedFnInstance.flush()
    }

    return wrappedFn
  }, [fn, delay, options])

  // Update the debounced function ref whenever fn, wait, or options change.
  useEffect(() => {
    debouncedFn.current = debounce(fn, delay, options)
  }, [fn, delay, options])

  return debounced
}

export default useDebounceCallback
