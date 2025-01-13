import BipPath from 'bip32-path'
import * as util from './util.js'
import { ModelIdSymbol } from '../constants.js'

export default class Address {
  address
  meta

  constructor(address, meta) {
    this.address = address
    this.meta = meta || {}
  }

  static get [ModelIdSymbol]() {
    return 'Address'
  }

  static isInstance(instance) {
    return instance?.constructor?.[ModelIdSymbol] === this[ModelIdSymbol]
  }

  static create(address, meta) {
    return Object.freeze(new Address(address, meta))
  }

  static fromJSON(json) {
    if (typeof json === 'string') json = JSON.parse(json)

    return Address.create(json.address, json.meta || json.path)
  }

  get pathArray() {
    return BipPath.fromString(this.meta.path || 'm/0/0').toPathArray()
  }

  toJSON() {
    return {
      address: this.address,
      meta: this.meta,
    }
  }

  // $FlowFixMe
  toString() {
    return this.address
  }

  // $FlowFixMe
  get [Symbol.toStringTag]() {
    return this.address
  }

  static isAddress(address) {
    return (
      typeof address === 'object' &&
      (address instanceof Address || ('address' in address && 'meta' in address))
    )
  }

  static util = util
}
