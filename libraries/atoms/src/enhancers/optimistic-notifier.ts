import makeConcurrent from 'make-concurrent'
import createInMemoryAtom from '../factories/memory.js'
import type { Atom, Listener, Unsubscribe } from '../utils/types.js'

const optimisticNotifier = <T>(atom: Atom<T>): Atom<T | undefined> => {
  const memoryAtom = createInMemoryAtom<T | undefined>() // eslint-disable-line @exodus/hydra/in-memory-atom-default-value

  const set = makeConcurrent(async (newValue: T, fromRemote: boolean) => {
    let previous: T | undefined
    await memoryAtom.set((previousValue: T | undefined) => {
      previous = previousValue
      return newValue
    })

    if (fromRemote) return

    atom
      .set(newValue)
      // only revert in case the value hasn't changed in the meanwhile
      .catch(() => memoryAtom.set((value) => (value === newValue ? previous : value)))
  })

  let unsubscribeSource: Unsubscribe | undefined
  let subscribers = 0

  const maybeUnsubscribeSource = () => {
    subscribers -= 1
    if (subscribers > 0) return
    unsubscribeSource!()
    unsubscribeSource = undefined
  }

  const observe = (callback: Listener<T | undefined>) => {
    if (subscribers === 0) {
      unsubscribeSource = atom.observe((value: T) => set(value, true))
    }

    subscribers += 1
    const unsubscribe = memoryAtom.observe(callback)

    return () => {
      unsubscribe()
      maybeUnsubscribeSource()
    }
  }

  const get = async () => {
    if (subscribers === 0) {
      return atom.get()
    }

    return memoryAtom.get()
  }

  const _set: Atom<T>['set'] = (value) => set(value, false)

  return {
    ...memoryAtom,
    set: _set,
    get,
    observe,
  }
}

export default optimisticNotifier
