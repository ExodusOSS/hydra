import delay from 'delay'
import assert from 'minimalistic-assert'
import type { Atom, Listener } from '../utils/types.js'

type Params<T> = {
  atom: Atom<T>
  timeout: number
}

const timeoutObservers = <T>({ atom, timeout }: Params<T>): Atom<T> => {
  assert(atom, 'expected "atom')
  assert(typeof timeout === 'number', 'expected number "timeout"')

  const observe = (observer: Listener<T>) =>
    atom.observe(async (...args) => {
      const timeoutPromise = delay.reject(timeout, {
        value: new Error('Observer timed out!'),
      })

      await Promise.race([
        //
        observer(...args),
        timeoutPromise,
      ]).then(() => timeoutPromise.clear())
    })

  return {
    ...atom,
    observe,
  }
}

export default timeoutObservers
