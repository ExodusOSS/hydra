import makeConcurrent from 'make-concurrent'
import proxyFreeze from 'proxy-freeze'
import type { Atom, Listener } from './utils/types.js'
import { isSetter } from './utils/guards.js'

const isReadonlySetOrMap = (value: unknown): boolean =>
  ['[object ReadonlySet]', '[object ReadonlyMap]'].includes(Object.prototype.toString.call(value))

const freeze = (value: object) => (isReadonlySetOrMap(value) ? value : proxyFreeze(value))

const withChangeDetection = <T>(listener: Listener<T>) => {
  let currentValue: T
  let called = false

  return async (value: T) => {
    if (called && value === currentValue) return

    called = true
    currentValue = value

    await listener(currentValue)
  }
}

type Params<T> = {
  makeGetNonConcurrent?: boolean
  getInitialized?: () => boolean
  defaultValue?: T
  set: (value: T) => Promise<void>
} & Omit<Atom<T>, 'set' | 'reset'>

const enforceObservableRules = <T>({
  defaultValue,
  makeGetNonConcurrent = false,
  getInitialized = () => true,
  ...atom
}: Params<T>): Atom<T> => {
  // ensure observers get called in series
  const enqueue = makeConcurrent((fn: () => void) => fn(), { concurrency: 1 })

  const postProcessValue = (value = defaultValue) =>
    value && typeof value === 'object' ? freeze(value) : value

  const nonConcurrentGet: Atom<T>['get'] = makeGetNonConcurrent
    ? makeConcurrent(atom.get)
    : atom.get
  const get = () => nonConcurrentGet().then(postProcessValue)

  const observe = (listener: Listener<T>) => {
    let called = false
    let valueEmittedFromGet: T | undefined
    let subscribed = true
    listener = withChangeDetection(listener)

    const publishSerially = (value: T) => {
      called = true
      return enqueue(() => listener(value))
    }

    // note: call observe() first to give it a chance to throw if it's not supported
    // if the subscription already fired once, ignore first get
    nonConcurrentGet().then((value) => {
      if (!subscribed) return
      if (!called) {
        valueEmittedFromGet = value
        publishSerially(postProcessValue(value))
      }
    })
    const unsubscribe = atom.observe((value) => {
      if (valueEmittedFromGet !== undefined) {
        const isAlreadyEmitted = value === valueEmittedFromGet
        valueEmittedFromGet = undefined // ignore changes from observe only for first call
        if (isAlreadyEmitted) {
          return
        }
      }

      return publishSerially(postProcessValue(value))
    })

    return () => {
      unsubscribe()
      subscribed = false
    }
  }

  const set = makeConcurrent(async (value: T | ((value: T) => T)) => {
    // support a function a la React's setState(oldState => newState)
    if (isSetter(value)) {
      const current = getInitialized() ? await get() : defaultValue
      value = await value(current)

      if (current === value) return
    }

    await atom.set(value)
  })

  return {
    get,
    set,
    reset: () => set(undefined),
    observe,
  }
}

export default enforceObservableRules
