import assert from 'minimalistic-assert'
import type { TxProps } from '../tx/index.js'
import Tx from '../tx/index.js'
import AddressSet from '../address-set/index.js'
import * as util from './util.js'
import { ModelIdSymbol } from '../constants.js'
import type NumberUnit from '@exodus/currency'
import type { WithType } from '../types.js'
import { createIsInstance } from '../utils.js'

const FACTORY_SYMBOL = Symbol('TxSet')

const createTxSet = ({ txs }: { txs: Map<string, Tx> }) =>
  new TxSet({ txs, initSymbol: FACTORY_SYMBOL })

const mutationTxIdsWithWarning: Record<string, string> = {}

function sorter(a: Tx, b: Tx) {
  let diff = +a.date - +b.date
  // For txs with the same date, we want a deterministic sort, so compare the txId strings
  if (diff === 0) diff = a.txId!.localeCompare(b.txId!)
  return diff
}

class TxSet {
  _txs: Map<string, Tx>
  _order: string[]
  _mutations?: { tx: Tx; balance: NumberUnit }[]
  addresses: AddressSet
  // private constructor, don't call it directly! Use static factory methods.
  constructor({ txs, initSymbol }: { txs: Map<string, Tx>; initSymbol: typeof FACTORY_SYMBOL }) {
    assert(initSymbol === FACTORY_SYMBOL, 'please use TxSet.EMPTY or TxSet.fromArray()')
    assert(txs, 'txs are required when constructing TxSet')
    assert(txs instanceof Map, 'txs must be a Map')
    // sort by most recent as last (ASC)
    const txArray = [...txs.values()]
    txArray.sort(sorter)
    this._txs = new Map(txArray.map((tx) => [tx.txId!, tx]))
    this._order = txArray.map((tx) => tx.txId!)
    this.addresses = AddressSet.fromArray(txArray.flatMap((tx) => [...tx.addresses]))
  }

  static get [ModelIdSymbol]() {
    return 'TxSet'
  }

  // can't assign directly to [Symbol.hasInstance] due to a babel bug
  // can't use this in static initializers due to another babel bug
  static _isInstance = createIsInstance(TxSet)
  static [Symbol.hasInstance](x: any) {
    return this._isInstance(x)
  }

  /**
   * @deprecated Use `instanceof` instead.
   */
  static isInstance = TxSet[Symbol.hasInstance]

  static EMPTY = new TxSet({ txs: new Map(), initSymbol: FACTORY_SYMBOL })

  static fromArray(arr: (Tx | TxProps)[] = []) {
    if (!Array.isArray(arr)) {
      console.warn(`Unexpected non-array value:`, arr)
      return TxSet.EMPTY
    }

    const converted: Tx[] = arr.map((tx) => (tx instanceof Tx ? tx : Tx.fromJSON(tx)))

    const txs = new Map(converted.map((tx) => [tx.txId!, tx]))
    return createTxSet({ txs })
  }

  // NOTE: subtle bug here, if new Tx is added with same ID, but slightly older date
  // will get replaced by current Tx object with same ID and not the one just added
  add(tx: Tx) {
    const oldTx = this.get(tx.txId!)
    if (oldTx && sorter(oldTx, tx) > 0) {
      // Explicitly preserve bug from previous implementation to keep compatibility
      return this
    }

    const txs = new Map(this._txs)
    txs.set(tx.txId!, tx)
    return createTxSet({ txs })
  }

  clone() {
    return createTxSet({ txs: new Map(this._txs) })
  }

  delete(tx: Tx | string) {
    const txObj = this.get(tx)
    if (!txObj) return this // nothing to remove
    const txs = new Map(this._txs)
    txs.delete(txObj.txId!)
    return createTxSet({ txs })
  }

  // key txId comparison only
  equals(otherSet: TxSet) {
    if (this._order.length !== otherSet._order.length) return false
    return this._order.every((item, i) => item === otherSet._order[i])
  }

  deepEquals(otherSet: TxSet) {
    if (this === otherSet) return true
    if (this.size !== otherSet.size) return false

    for (let i = this.size - 1; i >= 0; i--) {
      const tx = this.getAt(i)!
      const match = otherSet.get(tx)
      if (!match || !(tx === match || tx.equals(match))) {
        return false
      }
    }

    return true
  }

  get(tx: Tx | string) {
    return this._txs.get(String(tx))
  }

  getAt(order: number) {
    return this.get(this._order[order]!)
  }

  has(tx: Tx | string) {
    return this._txs.has(String(tx))
  }

  toJSON() {
    return [...this].map((tx) => tx.toJSON())
  }

  toRedactedJSON() {
    return [...this].map((tx) => tx.toRedactedJSON())
  }

  // TODO: consider merging txs together
  union(otherSet: TxSet) {
    const arr1 = [...this]
    const arr2 = [...otherSet]
    const both = [...arr1, ...arr2]
    const newSet = TxSet.fromArray(both)
    if (this.deepEquals(newSet)) return this

    return newSet
  }

  // used from a rescan
  // TODO: optimize
  update(otherSet: TxSet | (Tx | WithType<TxProps, 'coinAmount', NumberUnit>)[]) {
    if (otherSet instanceof TxSet && otherSet.deepEquals(this)) return this

    // since we just iterate the new txs, implicitly we get rid of the txs that we have but didn't find
    const txs = new Map(
      [...otherSet].map((otherTx) => {
        const oldTx = this.get(otherTx.txId!)
        const tx = { ...oldTx, ...otherTx }

        // coinAmount in the old one is the amount the user typed in the input box
        // in the (chain.so), it's the amount + fee
        if (oldTx) {
          // if signs are the same, we got the 'receive' or 'sent' part correct, if different, the rescan is correct
          if (
            Math.sign(tx.coinAmount!.toDefaultNumber()) ===
              Math.sign(oldTx.coinAmount!.toDefaultNumber()) && // only use old when signs are the same and there is no fee
            !tx.feeAmount
          ) {
            tx.coinAmount = oldTx.coinAmount
          }

          // if old has meta, usually exchange data, like ShapeShift order number
          // TODO: if new has meta, should consider merging old meta and new meta
          // existence of meta field isn't enough IIRC, meta is set as an empty object
          if (oldTx.meta) {
            tx.meta = { ...oldTx.meta }
          }
        }

        const newTx = Tx.fromJSON(tx as TxProps)
        return [newTx.txId, newTx]
      })
    )

    return createTxSet({ txs })
  }

  updateTxsProperties(items: (Partial<TxProps> & { txId: string })[]) {
    const txs = new Map(this._txs)
    let changed = false
    for (const item of items) {
      const tx = txs.get(item.txId)
      if (tx) {
        const newTx = tx.update(item)
        if (!tx.equals(newTx)) {
          txs.set(item.txId, newTx)
          changed = true
        }
      }
    }

    if (!changed) return this

    return createTxSet({ txs })
  }

  getMutations() {
    // Since a TxSet is immutable, this is memoized
    if (this._mutations) return this._mutations

    let balance: NumberUnit
    this._mutations = [...this].map((tx) => {
      try {
        if (balance === undefined) balance = tx.coinAmount!.unitType.ZERO

        // skip replaced tx by RBF
        if (!(tx.dropped || tx.data.replacedBy)) {
          if (!tx.error) {
            balance = balance.add(tx.coinAmount!)
          }

          if (tx.feeAmount?.unitType.equals(tx.coinAmount!.unitType)) {
            balance = balance.sub(tx.feeAmount)
          }
        }

        if (balance.isNegative && !mutationTxIdsWithWarning[tx.txId!]) {
          console.warn('negative balance in mutations calculation', {
            tx,
            balance,
          })
          mutationTxIdsWithWarning[tx.txId!] = tx.txId!
        }

        return { tx, balance }
      } catch (e: unknown) {
        if (typeof e !== 'object') throw e

        if (tx) {
          console.warn('failed to calculate mutation for tx', tx.toJSON())
          Object.assign(e!, {
            asset: tx.coinName,
            extraInfo: JSON.stringify(tx.toJSON()),
          })
        }

        throw e
      }
    })
    return this._mutations
  }

  reverse() {
    return {
      [Symbol.iterator]: () => {
        let i = this._order.length
        return {
          next: () =>
            i > 0 ? { value: this._txs.get(this._order[--i]!), done: false } : { done: true },
        }
      },
    }
  }

  [Symbol.iterator]() {
    return this._txs.values()
  }

  get size() {
    return this._txs.size
  }

  static util = util
}

TxSet.EMPTY = createTxSet({ txs: new Map() })

export default TxSet
