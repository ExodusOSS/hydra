import assert from 'minimalistic-assert'
import type { Atom, Listener, Logger } from '../utils/types.js'

type Params<T> = {
  atom: Atom<T>
  logger: Logger
}

const swallowObserverErrors = <T>({ atom, logger }: Params<T>) => {
  assert(atom, 'expected "atom')
  assert(typeof logger?.error === 'function', 'expected logger with ".error" function') // eslint-disable-line @typescript-eslint/no-unnecessary-condition

  const observe = (observer: Listener<T>) =>
    atom.observe(async (...args) => {
      try {
        await observer(...args)
      } catch (err) {
        logger.error('Observer threw error', err)
      }
    })

  return {
    ...atom,
    observe,
  }
}

export default swallowObserverErrors
