import { useEffect } from 'react'

const defaultIgnoreElements = []
// copied from https://github.com/ExodusMovement/exodus-desktop/blob/f680575aedc379dd18362e6357a81350e9a03c38/src/app/ui/hooks/use-on-click-outside.js
const useOnClickOutside = (ref, handler, ignoreElements = defaultIgnoreElements) => {
  useEffect(() => {
    if (!handler) {
      return
    }

    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }

      // Do nothing if clicking ignored element or descendent elements
      if (
        ignoreElements.some((elementId) => {
          const element = document.querySelector(`#${elementId}`)
          return element && element.contains(event.target)
        })
      ) {
        return
      }

      handler(event)
    }

    document.addEventListener('mousedown', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
    }
  }, [ref, handler, ignoreElements])
}

export default useOnClickOutside
