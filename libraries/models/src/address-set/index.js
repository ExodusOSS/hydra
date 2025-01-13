import assert from 'minimalistic-assert'
import Address from '../address/index.js'
import { ModelIdSymbol } from '../constants.js'
// bug in isAddress => can be address-like and still get added, but when fetched (get())
// will throw an error

export default class AddressSet {
  static EMPTY = AddressSet.fromArray([])
  _data

  constructor() {
    this._data = new Map()
  }

  static get [ModelIdSymbol]() {
    return 'AddressSet'
  }

  static isInstance(instance) {
    return instance?.constructor?.[ModelIdSymbol] === this[ModelIdSymbol]
  }

  static fromArray(arr) {
    const vals = arr.map((addr) => {
      if (typeof addr === 'string') return Address.create(addr)
      if (typeof addr === 'object') return Address.fromJSON(addr)
      if (addr instanceof Address) return addr

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
  add(address) {
    assert(Address.isAddress(address), 'Must be an instance of an Address.')
    const ac = new AddressSet()
    ac._data = new Map(this._data)
    ac._data.set(address.address, address)

    return ac
  }

  delete(address) {
    // TODO: deprecate 'remove'
    return this.remove(address)
  }

  get(address) {
    return this._data.get(String(address))
  }

  has(address) {
    return !!this._data.get(String(address))
  }

  // TODO: should deprecate and use 'delete()' to be consistent Set and Map interface
  remove(address) {
    const addrObj = this.get(address)
    if (!addrObj) return this // nothing to remove

    const ac = new AddressSet()
    ac._data = new Map(this._data)
    ac._data.delete(addrObj.address)

    return ac
  }

  sort(fn) {
    let arr = [...this]
    arr = arr.sort(fn)
    return AddressSet.fromArray(arr)
  }

  toArray() {
    return [...this._data.values()]
  }

  toAddressStrings() {
    return [...this._data.keys()]
  }

  // $FlowFixMe
  toString() {
    return [...this._data.keys()].join(', ')
  }

  union(otherSet) {
    const arr1 = [...this] // $FlowFixMe
    const arr2 = [...otherSet] // $FlowFixMe
    const both = [...arr1, ...arr2]
    return AddressSet.fromArray(both)
  }

  // $FlowFixMe
  [Symbol.iterator]() {
    return this._data.values()
  }

  get size() {
    return this._data.size
  }

  static PATH_SORTER = (a1, a2) => {
    const p1 = a1.pathArray
    const p2 = a2.pathArray

    if (p1[0] < p2[0]) return -1
    if (p1[0] > p2[0]) return 1
    if (p1[0] === p2[0]) {
      if (p1[1] < p2[1]) return -1
      if (p1[1] > p2[1]) return 1
      return 0
    }
  }
}
