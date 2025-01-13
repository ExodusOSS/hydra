import createCountdownLock from '../countdown-lock.js'
import createSimpleObserver from '../simple-observer.js'
import enforceObservableRules from '../enforce-rules.js'
import type { Atom, Listener, ReadonlyAtom, Unsubscribe } from '../utils/types.js'

type CombinedValue<T> = {
  [Key in keyof T]: T[Key] extends Atom<infer U> ? U : never
}

const combine = <T, U extends { [key: string]: Atom<T> }>(
  atoms: U
): ReadonlyAtom<CombinedValue<U>> => {
  const { notify, observe: observeSimpleObserver } = createSimpleObserver<CombinedValue<U>>()
  const countdownLock = createCountdownLock(Object.keys(atoms))

  let values: Partial<CombinedValue<U>> = {}
  let subscriptions: Unsubscribe[] = []
  let subscribers = 0

  const maybeUnsubscribeSourceObservables = () => {
    subscribers -= 1
    if (subscribers > 0) return
    subscriptions.forEach((unsubscribe) => unsubscribe())
    subscriptions = []
  }

  const observe = (callback: Listener<CombinedValue<U>>) => {
    subscribers += 1

    if (subscribers === 1) {
      subscriptions = Object.entries(atoms).map(([name, atom]) =>
        atom.observe(async (value) => {
          values = {
            ...values,
            [name]: value,
          }
          if (countdownLock.unlock(name)) await notify(values as CombinedValue<U>)
        })
      )
    }

    const unsubscribe = observeSimpleObserver(callback)
    return () => {
      unsubscribe()
      maybeUnsubscribeSourceObservables()
    }
  }

  const get = async () => {
    return Object.fromEntries(
      await Promise.all(Object.entries(atoms).map(async ([name, atom]) => [name, await atom.get()]))
    )
  }

  const set = async () => {
    throw new Error('combine does not support method: set')
  }

  return enforceObservableRules({
    get,
    set,
    observe,
  })
}

export default combine
