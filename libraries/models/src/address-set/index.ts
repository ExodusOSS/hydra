import assert from 'minimalistic-assert'
import type { AddressJson } from '../address/index.js'
import Address from '../address/index.js'
import { ModelIdSymbol } from '../constants.js'
import { createIsInstance } from '../utils.js'
// bug in isAddress => can be address-like and still get added, but when fetched (get())
// will throw an error

export default class AddressSet {
  _data

  constructor() {
    this._data = new Map()
  }

  static get [ModelIdSymbol]() {
    return 'AddressSet'
  }

  // can't assign directly to [Symbol.hasInstance] due to a babel bug
  // can't use this in static initializers due to another babel bug
  static _isInstance = createIsInstance(AddressSet)
  static [Symbol.hasInstance](x: any) {
    return this._isInstance(x)
  }

  /**
   * @deprecated Use `instanceof` instead.
   */
  static isInstance = AddressSet[Symbol.hasInstance]

  static EMPTY = AddressSet.fromArray([])

  static fromArray(arr: (Address | string | AddressJson)[]) {
    const vals = arr.map((addr) => {
      if (typeof addr === 'string') return Address.create(addr)
      if (addr instanceof Address) return addr
      if (typeof addr === 'object') return Address.fromJSON(addr)

      console.dir(addr)
      throw new Error(`AddressSet#fromArray(): unknown type`)
    })

    const ac = new AddressSet()
    for (const addr of vals) {
      ac._data.set(addr.address, addr)
    }

    return ac
  }

  // TODO: bug if address like
  add(address: Address) {
    assert(Address.isAddress(address), 'Must be an instance of an Address.')
    const ac = new AddressSet()
    ac._data = new Map(this._data)
    ac._data.set(address.address, address)

    return ac
  }

  delete(address: string | Address) {
    // TODO: deprecate 'remove'
    return this.remove(address)
  }

  get(address: string | Address) {
    return this._data.get(String(address))
  }

  has(address: string | Address) {
    return !!this._data.get(String(address))
  }

  // TODO: should deprecate and use 'delete()' to be consistent Set and Map interface
  remove(address: string | Address) {
    const addrObj = this.get(address)
    if (!addrObj) return this // nothing to remove

    const ac = new AddressSet()
    ac._data = new Map(this._data)
    ac._data.delete(addrObj.address)

    return ac
  }

  sort(fn: (a: Address, b: Address) => number) {
    let arr: Address[] = [...this]
    arr = arr.sort(fn)
    return AddressSet.fromArray(arr)
  }

  toArray() {
    return [...this._data.values()]
  }

  toRedactedJSON() {
    return this.toArray().map((addr) => addr.toRedactedJSON())
  }

  toAddressStrings() {
    return [...this._data.keys()]
  }

  toString() {
    return [...this._data.keys()].join(', ')
  }

  union(otherSet: AddressSet) {
    const arr1 = [...this]
    const arr2 = [...otherSet]
    const both = [...arr1, ...arr2]
    return AddressSet.fromArray(both)
  }

  [Symbol.iterator]() {
    return this._data.values()
  }

  get size() {
    return this._data.size
  }

  static PATH_SORTER = (a1: Address, a2: Address) => {
    const p1 = a1.pathArray
    const p2 = a2.pathArray

    if (p1[0] < p2[0]) return -1
    if (p1[0] > p2[0]) return 1
    if (p1[0] === p2[0]) {
      if (p1[1] < p2[1]) return -1
      if (p1[1] > p2[1]) return 1
      return 0
    }

    return 0
  }
}
