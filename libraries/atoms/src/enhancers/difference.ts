import type { Atom, Listener } from '../utils/types.js'

type Diff<T> = { previous: T | undefined; current: T }

type NonInitialDiff<T> = { previous: T; current: T }

type Options = {
  skipInitial?: boolean
}

type DiffForOptions<T, O extends Options | undefined> = O extends {
  skipInitial: true
}
  ? NonInitialDiff<T>
  : Diff<T>

const difference = <T, O extends Options | undefined = undefined>(
  atom: Atom<T>,
  options?: O
): Omit<Atom<T>, 'observe'> & { observe: Atom<DiffForOptions<T, O>>['observe'] } => {
  const observe = (callback: Listener<DiffForOptions<T, O>>) => {
    let prev: T | undefined
    let initialValueAssigned = false

    const selector = (value: T): Diff<T> => {
      const p = prev
      prev = value
      return { previous: p, current: value }
    }

    return atom.observe((value) => {
      const diffWrappedValue = selector(value)
      if (options?.skipInitial && !initialValueAssigned) {
        initialValueAssigned = true
        return
      }

      return callback(diffWrappedValue as DiffForOptions<T, O>)
    })
  }

  return {
    ...atom,
    observe,
  }
}

export default difference
