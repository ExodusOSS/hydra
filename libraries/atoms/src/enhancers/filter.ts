import makeConcurrent from 'make-concurrent'
import type { AnyAtom, AtomValue, Listener, SetAtomValue } from '../utils/types.js'

const limitConcurrency = <T extends (...args: any[]) => any>(fn: T): T =>
  makeConcurrent(fn, { concurrency: 1 })

type Predicate<A extends AnyAtom, S extends AtomValue<A>> =
  | ((value: AtomValue<A>) => value is S)
  | ((value: AtomValue<A>) => unknown)

type FilteredValue<A extends AnyAtom, P extends Predicate<A, any>> = P extends ((
  value: AtomValue<A>
) => value is infer S extends AtomValue<A>)
  ? S
  : AtomValue<A>

type ResultAtom<A extends AnyAtom, P extends Predicate<A, any>> = SetAtomValue<
  A,
  FilteredValue<A, P>
>

export default function filter<
  A extends AnyAtom,
  S extends AtomValue<A>,
  P extends Predicate<A, S>,
>(atom: A, predicate: P): ResultAtom<A, P> {
  const get = limitConcurrency(
    () =>
      new Promise<FilteredValue<A, P>>(async (resolve) => {
        const value = await atom.get()
        if (predicate(value)) {
          return resolve(value)
        }

        const unsubscribe = atom.observe((value) => {
          if (predicate(value)) {
            unsubscribe()
            resolve(value)
          }
        })
      })
  )

  const observe = (listener: Listener<FilteredValue<A, P>>) => {
    return atom.observe((value) => {
      if (predicate(value)) {
        return listener(value)
      }
    })
  }

  return { ...atom, observe, get } as ResultAtom<A, P>
}
