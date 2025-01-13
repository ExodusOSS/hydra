import makeConcurrent from 'make-concurrent'
import type { Atom, Listener } from '../utils/types.js'

const limitConcurrency = <T extends (...args: any[]) => any>(fn: T): T =>
  makeConcurrent(fn, { concurrency: 1 })

export default function filter<T>(atom: Atom<T>, predicate: (value: T) => boolean): Atom<T> {
  const get = limitConcurrency(
    () =>
      new Promise<T>(async (resolve) => {
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

  const observe = (listener: Listener<T>) => {
    return atom.observe((value) => {
      if (predicate(value)) {
        return listener(value)
      }
    })
  }

  return { ...atom, observe, get }
}
