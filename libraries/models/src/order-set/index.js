import { ModelIdSymbol } from '../constants.js'
import Order from '../order/index.js'
import assert from 'minimalistic-assert'

const FACTORY_SYMBOL = Symbol('OrderSet')

const createOrderSet = ({ items }) => new OrderSet({ items, initSymbol: FACTORY_SYMBOL })

function isObjectOrConvert(obj) {
  if (obj instanceof Order) return obj
  return Order.fromJSON(obj)
}

function addToTxMap(txMap, txId, orderId) {
  if (txId) {
    const oids = txMap.get(txId) || []
    if (oids.includes(orderId)) return
    txMap.set(txId, [...oids, orderId])
  }
}

class OrderSet {
  constructor({ items, initSymbol }) {
    assert(initSymbol === FACTORY_SYMBOL, 'please use OrderSet.EMPTY or OrderSet.fromArray()')
    assert(items instanceof Map, 'items must be a Map')

    const itemArray = [...items.values()]
    itemArray.sort((a, b) => b.date - a.date)
    const txMap = new Map()
    for (const item of itemArray) {
      if (item.txIds) {
        item.txIds.forEach(({ txId }) => {
          addToTxMap(txMap, txId, item.orderId)
        })
      }

      addToTxMap(txMap, item.fromTxId, item.orderId)
      addToTxMap(txMap, item.toTxId, item.orderId)
    }

    this._items = new Map(itemArray.map((item) => [String(item), item])) // <orderId, Order>
    this._txMap = txMap // <txId, Array[orderId]>
    this._sortOrder = itemArray.map((tx) => tx.orderId) // Array[orderId] sorted by date desc
  }

  static get [ModelIdSymbol]() {
    return 'OrderSet'
  }

  static isInstance(instance) {
    return instance?.constructor?.[ModelIdSymbol] === this[ModelIdSymbol]
  }

  // TODO: there is a bug if both sets have the same orderId but different fields
  // consider a merge in this scenario?
  static fromArray(arr) {
    if (arr == null) return OrderSet.EMPTY
    return createOrderSet({
      items: new Map(arr.map(isObjectOrConvert).map((item) => [String(item), item])),
    })
  }

  add(item) {
    return this.addBulk([item])
  }

  // TODO: optimize, this seems pretty inefficient
  // there may be a bug here if an Order with the same orderId is added
  addBulk(items) {
    if (!items) return this

    for (const item of items) {
      // implies we already have it, consider throwing
      // for now, maintain the same behavior
      if (this.get(item)) {
        console.log(`OrderSet#add() already has #{item.orderId}`)
      }
    }

    return createOrderSet({
      items: new Map([...this._items.values(), ...items].map((item) => [String(item), item])),
    })
  }

  clone() {
    return createOrderSet({ items: new Map(this._items) })
  }

  delete(item) {
    const itemObj = this.get(item)
    if (!itemObj) return this // nothing to remove
    const items = new Map(this._items)
    items.delete(itemObj.orderId)
    return createOrderSet({ items })
  }

  // key id comparison only
  equals(otherSet) {
    if (this._sortOrder.length !== otherSet._sortOrder.length) return false
    const len = this._sortOrder.length // am I cargo culting here?
    for (let i = 0; i < len; ++i) {
      if (this._sortOrder[i] !== otherSet._sortOrder[i]) return false
    }

    return true
  }

  get(item) {
    return this._items.get(String(item))
  }

  getAt(index) {
    return this.get(this._sortOrder[index])
  }

  // should be used by default unless you intend to get multiple orders back for the same txid
  getByTxId(txId, index = 0) {
    const oids = this._txMap.get(txId) || []
    return this._items.get(oids[index])
  }

  // used when multiple exchanges are returned in the same TX
  getAllByTxId(txId) {
    const oids = this._txMap.get(txId) || []
    return oids.map((oid) => this._items.get(oid))
  }

  has(item) {
    return this._items.has(String(item))
  }

  toJSON() {
    return [...this].map((item) => item.toJSON())
  }

  filter(callbackFn) {
    return OrderSet.fromArray([...this].filter(callbackFn))
  }

  // @deprecated
  toJSONLegacy() {
    console.log(
      'OrderSet: calling deprecated function orderSet.toJSONLegacy(), use orderSetToJSONLegacy() instead'
    )

    return [...this].map((item) => item.toJSONLegacy())
  }

  // NOTE: precondition that both sets are mutually exclusive
  // in the event they are not, the resulting set would not contain data
  // from both orders, it would contain the data in the otherSet
  // this behavior may need to be changed
  union(otherSet) {
    const arr1 = [...this]
    const arr2 = [...otherSet]
    const both = [...arr1, ...arr2]
    return OrderSet.fromArray(both)
  }

  // TODO: consider treating this an upsert i.e. if Order does not exist, add it
  update(newItems) {
    const items = new Map(this._items)
    for (const newItem of newItems) {
      const thisItem = items.get(String(newItem))
      // TODO: potential upsert modification?
      if (!thisItem) {
        console.log('OrderSet#update() order does not contain an `orderId`. Skipping...')
        continue
      }

      items.set(String(newItem), thisItem.update(newItem))
    }

    return createOrderSet({ items })
  }

  [Symbol.iterator]() {
    return this._items.values()
  }

  get size() {
    return this._items.size
  }
}

OrderSet.EMPTY = createOrderSet({ items: new Map() })

export default OrderSet
