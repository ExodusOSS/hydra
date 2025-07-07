import EventEmitter from 'eventemitter3'

import fromEventEmitter from '../event-emitter.js'
import type { DeferredPromise } from 'p-defer'
import pDefer from 'p-defer'
import type { Atom } from '../utils/types.js'

type Params<T> = {
  defaultValue?: T
}

const createAtomMock = <T>(options: Params<T> = {}): Atom<T> => {
  const { defaultValue } = options

  let latestValue = defaultValue

  const emitter = new EventEmitter()

  const initialized = pDefer() as DeferredPromise<void> & { resolved: boolean }

  const get = async () => {
    if (!Object.hasOwn(options, 'defaultValue')) {
      await initialized.promise
    }

    return latestValue as T
  }

  const set = async (data: T) => {
    latestValue = data
    if (data !== undefined) {
      initialized.resolve()
      initialized.resolved = true
    }

    if (initialized.resolved) {
      emitter.emit('data', data)
    }
  }

  return fromEventEmitter({
    ...options,
    getInitialized: () => initialized.resolved,
    emitter,
    event: 'data',
    get,
    set,
  })
}

export default createAtomMock
