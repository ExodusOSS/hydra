import assert from 'minimalistic-assert'
import type { FiatOrderProps } from '../fiat-order/index.js'
import FiatOrder from '../fiat-order/index.js'
import { ModelIdSymbol } from '../constants.js'
import type { Provider } from '../fiat-order/constants.js'
import { createIsInstance } from '../utils.js'

const FACTORY_SYMBOL = Symbol('FiatOrderSet')

type ConvertToOrder<T extends FiatOrder | FiatOrderProps> = T extends FiatOrder
  ? T
  : T extends FiatOrderProps<infer P>
    ? FiatOrder<P>
    : never

function isObjectOrConvert<T extends FiatOrder | FiatOrderProps>(obj: T): ConvertToOrder<T> {
  return (obj instanceof FiatOrder ? obj : FiatOrder.fromJSON(obj)) as ConvertToOrder<T>
}

export default class FiatOrderSet {
  private readonly _sortOrder: string[]
  private readonly _items: Map<string, FiatOrder>
  private _txMap = new Map<string, string[]>()

  constructor({
    items,
    initSymbol,
  }: {
    initSymbol: typeof FACTORY_SYMBOL
    items: Map<string, FiatOrder>
  }) {
    assert(
      initSymbol === FACTORY_SYMBOL,
      'please use FiatOrderSet.EMPTY or FiatOrderSet.fromArray()'
    )

    const itemArray = [...items.values()]
    itemArray.sort((a, b) => +b.date - +a.date)
    this._items = items
    this._sortOrder = itemArray.map((tx) => tx.orderId)

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

  // can't assign directly to [Symbol.hasInstance] due to a babel bug
  // can't use this in static initializers due to another babel bug
  static _isInstance = createIsInstance(FiatOrderSet)
  static [Symbol.hasInstance](x: any) {
    return this._isInstance(x)
  }

  /**
   * @deprecated Use `instanceof` instead.
   */
  static isInstance = FiatOrderSet[Symbol.hasInstance]

  static EMPTY = new FiatOrderSet({
    items: new Map<string, FiatOrder<Provider>>(),
    initSymbol: FACTORY_SYMBOL,
  })

  static fromArray(arr?: (FiatOrder | FiatOrderProps)[]): FiatOrderSet {
    if (!arr || (Array.isArray(arr) && arr.length === 0)) {
      return FiatOrderSet.EMPTY
    }

    const errors = []
    const items = new Map<string, FiatOrder>()

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

  add(item: FiatOrder): FiatOrderSet | undefined {
    if (this.has(item)) {
      return
    }

    return FiatOrderSet.fromArray([...this, item])
  }

  clone() {
    return FiatOrderSet.fromArray(this.toJSON())
  }

  delete(item: FiatOrder): FiatOrderSet | undefined {
    if (!this.has(item)) {
      return
    }

    return FiatOrderSet.fromArray(this.toJSON().filter(({ orderId }) => orderId !== String(item)))
  }

  // key id comparison only
  equals(otherSet: FiatOrderSet) {
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

  has(item: FiatOrder<Provider>) {
    return this._items.has(String(item))
  }

  get(item: FiatOrder<Provider> | string) {
    return this._items.get(String(item))
  }

  getAt(index: number) {
    return this.get(this.#getSortedIdAt(index)!)
  }

  // should be used by default unless you intend to get multiple orders back for the same txid
  getByTxId(txId: string, index = 0) {
    const oids = this.#getIdsByTx(txId)

    return this.get(oids[index]!)
  }

  getAllByTxId(txId: string) {
    return this.#getIdsByTx(txId).map((oid) => this.get(oid))
  }

  #getIdsByTx(txId: string) {
    return this._txMap.get(txId) || []
  }

  #getSortedIdAt(index: number) {
    return this._sortOrder[index]
  }

  toJSON() {
    return [...this].map((item) => item.toJSON())
  }

  toRedactedJSON() {
    return [...this].map((item) => item.toRedactedJSON())
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
  union(otherSet: FiatOrderSet) {
    const arr1 = [...this]
    const arr2 = [...otherSet]
    const union = [...arr1, ...arr2]

    return FiatOrderSet.fromArray(union)
  }

  update(items: FiatOrder[]): FiatOrderSet {
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
