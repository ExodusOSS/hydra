// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import type { Atom, Listener, Setter } from '../utils/types.js'
import { isSetter } from '../utils/guards.js'

const { isEqual } = lodash

const dedupe = <T>(atom: Atom<T>): Atom<T> => {
  const set = (value: T | Setter<T>) => {
    // avoid triggering a get() when we're resetting the atom
    if (value === undefined) return atom.reset()

    return atom.set(async (previous) => {
      const newValue = isSetter(value) ? await value(previous) : value
      return isEqual(previous, newValue) ? previous : newValue
    })
  }

  const observe = (callback: Listener<T>) => {
    let called = false
    let previous: T
    return atom.observe(async (value) => {
      if (called && isEqual(previous, value)) return

      called = true
      previous = value
      return callback(value)
    })
  }

  return {
    ...atom,
    set,
    observe,
  }
}

export default dedupe
