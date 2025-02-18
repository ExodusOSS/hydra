import BipPath from 'bip32-path'
import * as util from './util.js'
import { ModelIdSymbol } from '../constants.js'
import { createIsInstance } from '../utils.js'

type AddressMeta = {
  path: string
  [key: string]: any
}

export type AddressJson = {
  address: string
  meta?: AddressMeta
}

export default class Address {
  address: string
  meta: Partial<AddressMeta>

  constructor(address: string, meta?: AddressMeta) {
    this.address = address
    this.meta = meta || Object.create(null)
  }

  static get [ModelIdSymbol]() {
    return 'Address'
  }

  static isInstance = createIsInstance(Address)

  static [Symbol.hasInstance](instance: unknown): instance is Address {
    return this.isInstance(instance)
  }

  static create(address: string, meta?: AddressMeta) {
    return Object.freeze(new Address(address, meta))
  }

  static fromJSON(json: string | AddressJson) {
    const data = typeof json === 'string' ? JSON.parse(json) : json

    return Address.create(data.address, data.meta || data.path)
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

  toString() {
    return this.address
  }

  get [Symbol.toStringTag]() {
    return this.address
  }

  static isAddress(address: unknown): address is Address {
    return (
      typeof address === 'object' &&
      address !== null &&
      (address instanceof Address || ('address' in address && 'meta' in address))
    )
  }

  static util = util
}
