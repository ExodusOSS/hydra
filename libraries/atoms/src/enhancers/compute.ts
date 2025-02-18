import { safeMemoize } from '../utils/memoize.js'
import type { Atom, Listener, ReadonlyAtom } from '../utils/types.js'

type Params<T, V> = {
  atom: Atom<T> | ReadonlyAtom<T>
  selector: (value: T) => V | Promise<V>
}

const compute = <T, V>({ atom, selector }: Params<T, V>): ReadonlyAtom<V> => {
  const memoizedSelector = safeMemoize((value: T) => selector(value))

  const get = async () => {
    const values = await atom.get()
    return memoizedSelector(values)
  }

  const set = async () => {
    throw new Error('selected atom does not support set')
  }

  const observe = (callback: Listener<V>) => {
    let prev: V
    let called: boolean
    return atom.observe(async (values) => {
      const selected = await memoizedSelector(values)
      if (called && prev === selected) return
      called = true
      prev = selected
      return callback(selected)
    })
  }

  const computed = {
    ...atom,
    get,
    set,
    observe,
  }

  return computed as ReadonlyAtom<V> // casting here because we want to have a throwing set for javascript consumers
}

export default compute
