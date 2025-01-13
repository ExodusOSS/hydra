// handlers: {
//  'Enter': (e) => {},
//  'Escape': (e) => {},
//  ...
// }

import throttle from 'lodash/throttle'
import { useEffect, useMemo, useRef } from 'react'

const useKeyEventHandlers = (handlers) => {
  const savedHandlers = useRef(Object.create(null))

  useEffect(() => {
    savedHandlers.current = handlers
  }, [handlers])

  // convert to string for useMemo to work properly
  const keys = useMemo(() => Object.keys(handlers).join('|'), [handlers])

  // add a separate throttle for each key
  const throttledKeyHandlers = useMemo(() => {
    const handlers = Object.create(null)
    if (keys.length === 0) return handlers

    keys.split('|').forEach((key) => {
      handlers[key] = throttle(
        (e) => savedHandlers.current[e.key] && savedHandlers.current[e.key](e),
        500,
        {
          trailing: false,
        }
      )
    })
    return handlers
  }, [keys])

  return (e) => {
    if (handlers[e.key]) {
      e.stopPropagation()
      e.preventDefault()
      return throttledKeyHandlers[e.key](e)
    }

    return false
  }
}

export default useKeyEventHandlers
