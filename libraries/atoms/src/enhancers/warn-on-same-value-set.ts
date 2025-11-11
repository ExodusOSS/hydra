import assert from 'minimalistic-assert'

// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import stringify from 'json-stringify-safe'

import type { Atom, Logger } from '../utils/types.js'

const { isEqual: deepEqual } = lodash

const STRINGIFY_LIMIT = 1000

/**
 * Serialize an object to a JSON string with a limit on the number of properties shown
 */
const limitedStringify = <T>(obj: T, limit = STRINGIFY_LIMIT) => {
  let count = 0

  return stringify(obj, (_, value) => {
    if (count > limit) {
      return
    }

    if (count === limit) {
      count++
      return '...more properties not shown'
    }

    count++
    return value
  })
}

type Params<T> = {
  atom: Atom<T>
  logger: Logger
  isEqual?: (a: unknown, b: unknown) => boolean
}

const warnOnSameValueSet = <T>({ atom, isEqual = deepEqual, logger }: Params<T>): Atom<T> => {
  assert(atom, 'expected "atom')
  assert(typeof logger?.warn === 'function', 'expected logger with ".warn" function') // eslint-disable-line @typescript-eslint/no-unnecessary-condition

  let previousValue: T
  atom.observe((value) => {
    if (value !== undefined && isEqual(value, previousValue)) {
      // limit value shown to avoid a CPU spike that can lead to Android freezing
      logger.warn(
        `Atom was called with the same value it currently holds: ${limitedStringify(value)}`
      )
    }

    previousValue = value
  })

  return atom
}

export default warnOnSameValueSet
