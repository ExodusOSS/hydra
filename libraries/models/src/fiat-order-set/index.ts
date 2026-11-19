import assert from 'minimalistic-assert'
import type { FiatOrderProps } from '../fiat-order/index.js'
import FiatOrder from '../fiat-order/index.js'
import { ModelIdSymbol } from '../constants.js'
import type { Provider } from '../fiat-order/constants.js'
import { createIsInstance } from '../utils.js'

const FACTORY_SYMBOL = Symbol('FiatOrderSet')

// Symbol-keyed instance state. These symbols are module-private (not exported),
// so consumers cannot read them — but they are own enumerable properties as far
// as `lodash.isEqual` is concerned, which preserves the structural equality
// contract that callers (e.g. Redux selectors) rely on. See the
// `lodash isEqual` block in the unit tests.
const ITEMS = Symbol('items')
const SORT_ORDER = Symbol('sortOrder')
const TX_MAP = Symbol('txMap')

type ConvertToOrder<T extends FiatOrder | FiatOrderProps> = T extends FiatOrder
  ? T
  : T extends FiatOrderProps<infer P>
    ? FiatOrder<P>
    : never

function isObjectOrConvert<T extends FiatOrder | FiatOrderProps>(obj: T): ConvertToOrder<T> {
  return (obj instanceof FiatOrder ? obj : FiatOrder.fromJSON(obj)) as ConvertToOrder<T>
}

export default class FiatOrderSet {
  readonly [SORT_ORDER]: string[]
  readonly [ITEMS]: Map<string, FiatOrder>;
  [TX_MAP] = new Map<string, string[]>()

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
    this[ITEMS] = items
    this[SORT_ORDER] = itemArray.map((tx) => tx.orderId)

    for (const item of itemArray) {
      if (!item.txId) {
        continue
      }

      const oids = this.#getIdsByTx(item.txId)

      if (oids.includes(String(item))) {
        continue
      }

      this[TX_MAP].set(item.txId, [...oids, String(item)])
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

  add(item: FiatOrder): FiatOrderSet {
    if (this.has(item)) {
      return this
    }

    return FiatOrderSet.fromArray([...this, item])
  }

  clone() {
    return FiatOrderSet.fromArray(this.toJSON())
  }

  delete(item: FiatOrder): FiatOrderSet {
    if (!this.has(item)) {
      return this
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
    return this[ITEMS].has(String(item))
  }

  get(item: FiatOrder<Provider> | string) {
    return this[ITEMS].get(String(item))
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
    return this[TX_MAP].get(txId) || []
  }

  #getSortedIdAt(index: number) {
    return this[SORT_ORDER][index]
  }

  toJSON() {
    return [...this].map((item) => item.toJSON())
  }

  toRedactedJSON() {
    return [...this].map((item) => item.toRedactedJSON())
  }

  [Symbol.iterator]() {
    return this[ITEMS].values()
  }

  get size() {
    return this[ITEMS].size
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
