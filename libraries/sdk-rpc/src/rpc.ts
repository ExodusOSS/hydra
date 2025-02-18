import JsonRPC, { type Transport } from '@exodus/json-rpc'
import EventEmitter from 'eventemitter3'
import ms from 'ms'

import { SEPARATOR } from './constants.js'
import type { Fn, JsonRPCParams, Listener, Methods } from './types.js'

const serializePath = (path: string[]) => path.join(SEPARATOR)

export const flattenObject = <T>(obj: T, path: string[] = []): { [name: string]: Fn } => {
  if (typeof obj === 'function') {
    return { [serializePath(path)]: obj as Fn }
  }

  if (typeof obj !== 'object' || !obj) return {}

  return Object.keys(obj).reduce((acc, key) => {
    return { ...acc, ...flattenObject(obj[key as keyof T], [...path, key]) }
  }, {})
}

type ConstructorParams = {
  transport: Transport
  requestTimeout?: number
  serialize?: JsonRPCParams[0]['stringify']
  deserialize?: JsonRPCParams[0]['parse']
}

class RPC extends JsonRPC {
  _emitter = new EventEmitter()

  constructor({ transport, serialize, deserialize, requestTimeout = ms('5m') }: ConstructorParams) {
    super({
      transport,
      requestTimeout,
      parse: deserialize,
      stringify: serialize,
    })
  }

  // @ts-expect-error this overrides the parent method's signature with TS does not allow but which the original JS code did
  exposeMethods(methods: Methods) {
    const current = Object.fromEntries(this._methods)
    const flattenMethods = flattenObject(methods)

    return super.exposeMethods({ ...current, ...flattenMethods })
  }

  on(eventName: string, listener: Listener) {
    this._emitter.on(eventName, listener)
  }

  once(eventName: string, listener: Listener) {
    this._emitter.once(eventName, listener)
  }

  end() {
    super.end()
    this._emitter.emit('end')
  }
}

export default RPC
