import JsonRPC from '@exodus/json-rpc'
import EventEmitter from 'eventemitter3'
import ms from 'ms'

import { SEPARATOR } from './constants.js'

const serializePath = (path) => path.join(SEPARATOR)

export const flattenObject = (obj, path = []) => {
  if (typeof obj === 'function') {
    return { [serializePath(path)]: obj }
  }

  if (typeof obj !== 'object') return

  return Object.keys(obj).reduce((acc, key) => {
    return { ...acc, ...flattenObject(obj[key], [...path, key]) }
  }, {})
}

class RPC extends JsonRPC {
  _emitter = new EventEmitter()

  constructor({ transport, serialize, deserialize, requestTimeout = ms('5m') }) {
    super({
      transport,
      requestTimeout,
      parse: deserialize,
      stringify: serialize,
    })
  }

  exposeMethods(methods) {
    const current = Object.fromEntries(this._methods)
    const flattenMethods = flattenObject(methods)
    super.exposeMethods({ ...current, ...flattenMethods })
  }

  on(eventName, listener) {
    this._emitter.on(eventName, listener)
  }

  once(eventName, listener) {
    this._emitter.once(eventName, listener)
  }

  end() {
    super.end()
    this._emitter.emit('end')
  }
}

export default RPC
