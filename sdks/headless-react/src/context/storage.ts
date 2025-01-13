import makeConcurrent from 'make-concurrent'
import { isPlainObject } from '@exodus/basic-utils'
import { Storage } from '@exodus/storage-interface'

import { State, SetPayload } from '../types.js'

const STATE_KEY = 'state'

const createUiStorage = (storage?: Storage<State, State>) => {
  if (!storage) return

  const instance = storage.namespace('ui')

  const get = () => instance.get(STATE_KEY)

  let state: State = Object.create(null)
  const loadPromise = instance.get(STATE_KEY).then((data) => {
    state = isPlainObject(data) ? data : Object.create(null)
  })

  const set = makeConcurrent(async ({ namespace, key, value }: SetPayload) => {
    if (typeof key !== 'string') {
      throw new TypeError(`ui-storage: key should be a string, got ${key}`)
    }

    if (typeof namespace !== 'string') {
      throw new TypeError(`ui-storage: namespace should be a string, got ${namespace}`)
    }

    await loadPromise

    state = {
      ...state,
      [namespace]: {
        ...state[namespace],
        [key]: value,
      },
    }

    await instance.set(STATE_KEY, state)
  })

  return { get, set }
}

export default createUiStorage
