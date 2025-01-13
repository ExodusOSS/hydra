import type { Atom, Listener } from '../utils/types.js'

type Diff<T> = { previous?: T; current: T }

const difference = <T>(
  atom: Atom<T>
): Omit<Atom<T>, 'observe'> & { observe: Atom<Diff<T>>['observe'] } => {
  const observe = (callback: Listener<Diff<T>>) => {
    let prev: T | undefined

    const selector = (value: T) => {
      const p = prev
      prev = value
      return { previous: p, current: value }
    }

    return atom.observe((value) => callback(selector(value)))
  }

  return {
    ...atom,
    observe,
  }
}

export default difference
