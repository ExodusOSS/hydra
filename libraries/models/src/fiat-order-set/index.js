import assert from 'minimalistic-assert'
import FiatOrder from '../fiat-order/index.js'
import { ModelIdSymbol } from '../constants.js'

const FACTORY_SYMBOL = Symbol('FiatOrderSet')

function isObjectOrConvert(obj) {
  return obj instanceof FiatOrderSet ? obj : FiatOrder.fromJSON(obj)
}

export default class FiatOrderSet {
  constructor({ items, initSymbol }) {
    assert(
      initSymbol === FACTORY_SYMBOL,
      'please use FiatOrderSet.EMPTY or FiatOrderSet.fromArray()'
    )

    const itemArray = [...items.values()]
    itemArray.sort((a, b) => b.date - a.date)
    this._items = items
    this._sortOrder = itemArray.map((tx) => tx.orderId)
    this._txMap = new Map()

    for (const item of itemArray) {
      if (!item.txId) {
        continue
      }

      const oids = this.#getIdsByTx(item.txId)

      if (oids.includes(String(item))) {
        continue
      }

      this._txMap.set(item.txId, [...oids, String(item)])
    }
  }

  static get [ModelIdSymbol]() {
    return 'FiatOrderSet'
  }

  static isInstance(instance) {
    return instance?.constructor?.[ModelIdSymbol] === this[ModelIdSymbol]
  }

  static EMPTY = new FiatOrderSet({ items: new Map(), initSymbol: FACTORY_SYMBOL })

  static fromArray(arr) {
    if (!arr || (Array.isArray(arr) && arr.length === 0)) {
      return FiatOrderSet.EMPTY
    }

    const errors = []
    const items = new Map()

    for (const item of arr) {
      try {
        const item_ = isObjectOrConvert(item)
        items.set(String(item_), item_)
      } catch (error) {
        errors.push([error, item])
      }
    }

    if (errors.length > 0) {
      console.warn('FiatOrderSet failed to convert object to FiatOrder', errors)
    }

    return new FiatOrderSet({ items, initSymbol: FACTORY_SYMBOL })
  }

  add(item) {
    if (this.has(item)) {
      return
    }

    return FiatOrderSet.fromArray([...this, item])
  }

  clone() {
    return FiatOrderSet.fromArray(this.toJSON())
  }

  delete(item) {
    if (!this.has(item)) {
      return
    }

    return FiatOrderSet.fromArray(this.toJSON().filter(({ orderId }) => orderId !== String(item)))
  }

  // key id comparison only
  equals(otherSet) {
    if (this.size !== otherSet.size) {
      return false
    }

    for (let i = 0; i < this.size; ++i) {
      if (this.#getSortedIdAt(i) !== otherSet.#getSortedIdAt(i)) {
        return false
      }
    }

    return true
  }

  has(item) {
    return this._items.has(String(item))
  }

  get(item) {
    return this._items.get(String(item))
  }

  getAt(index) {
    return this.get(this.#getSortedIdAt(index))
  }

  // should be used by default unless you intend to get multiple orders back for the same txid
  getByTxId(txId, index = 0) {
    const oids = this.#getIdsByTx(txId)

    return this.get(oids[index])
  }

  getAllByTxId(txId) {
    return this.#getIdsByTx(txId).map((oid) => this.get(oid))
  }

  #getIdsByTx(txId) {
    return this._txMap.get(txId) || []
  }

  #getSortedIdAt(index) {
    return this._sortOrder[index]
  }

  toJSON() {
    return [...this].map((item) => item.toJSON())
  }

  [Symbol.iterator]() {
    return this._items.values()
  }

  get size() {
    return this._items.size
  }

  // NOTE: precondition that both sets are mutually exclusive
  // in the event they are not, the resulting set would not contain data
  // from both orders, it would contain the data in the otherSet
  // this behavior may need to be changed
  union(otherSet) {
    const arr1 = [...this]
    const arr2 = [...otherSet]
    const union = [...arr1, ...arr2]

    return FiatOrderSet.fromArray(union)
  }

  update(items) {
    const updatedItems = []

    for (const item of items) {
      const existingItem = this.get(item)

      if (existingItem) {
        const updatedItem = existingItem.update({ ...item })

        if (existingItem !== updatedItem) {
          updatedItems.push(updatedItem)
        }
      }
    }

    if (updatedItems.length === 0) {
      return this
    }

    return FiatOrderSet.fromArray([...this.toJSON(), ...updatedItems])
  }
}
