import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useEffect, useRef } from 'react'

// Based on https://usehooks.com/useEventListener/
// but uses useFocusEffect so that the event listener is removed when Screen goes out of focus
const useScreenEventListener = (eventName, handler, element = window) => {
  const savedHandler = useRef()

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])
  useFocusEffect(
    useCallback(() => {
      const isSupported = element && element.addEventListener
      if (!isSupported) return

      const eventListener = (event) => savedHandler.current(event)

      element.addEventListener(eventName, eventListener)

      return () => {
        element.removeEventListener(eventName, eventListener)
      }
    }, [eventName, element])
  )
}

export default useScreenEventListener
