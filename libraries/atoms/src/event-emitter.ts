import enforceObservableRules from './enforce-rules.js'
import type { EventEmitter, Listener } from './utils/types.js'

type Params<T> = {
  emitter: EventEmitter
  event: string
  set: (value: T) => Promise<void>
  get: () => Promise<T>
  defaultValue?: T
  getInitialized?: () => boolean
}

const fromEventEmitter = <T>({
  emitter,
  event,
  get,
  set,
  defaultValue,
  getInitialized,
}: Params<T>) => {
  const observe = (listener: Listener<T>) => {
    emitter.on(event, listener)
    return () => emitter.removeListener(event, listener)
  }

  return enforceObservableRules({
    getInitialized,
    get,
    set,
    observe,
    defaultValue,
  })
}

export default fromEventEmitter
