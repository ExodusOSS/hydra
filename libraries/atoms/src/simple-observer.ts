import type { Listener } from './utils/types.js'

const createSimpleObserver = <T>({ enable = true } = {}) => {
  let listeners: Listener<T>[] = []

  const notify = async (value: T) => Promise.all(listeners.map((listener) => listener(value)))

  const observe = (listener: Listener<T>) => {
    if (!enable) {
      throw new Error('observe method is not supported')
    }

    listeners.push(listener)
    return () => {
      listeners = listeners.filter((fn) => fn !== listener)
    }
  }

  return {
    listeners,
    observe,
    notify,
  }
}

export default createSimpleObserver
