import assert from 'minimalistic-assert'
import Tx from '../tx/index.js'
import AddressSet from '../address-set/index.js'
import * as util from './util.js'
import { ModelIdSymbol } from '../constants.js'

const FACTORY_SYMBOL = Symbol('TxSet')

const createTxSet = ({ txs }) => new TxSet({ txs, initSymbol: FACTORY_SYMBOL })

const mutationTxIdsWithWarning = {}

function sorter(a, b) {
  let diff = a.date - b.date
  // For txs with the same date, we want a deterministic sort, so compare the txId strings
  if (diff === 0) diff = a.txId.localeCompare(b.txId)
  return diff
}

class TxSet {
  // private constructor, don't call it directly! Use static factory methods.
  constructor({ txs, initSymbol }) {
    assert(initSymbol === FACTORY_SYMBOL, 'please use TxSet.EMPTY or TxSet.fromArray()')
    assert(txs, 'txs are required when constructing TxSet')
    assert(txs instanceof Map, 'txs must be a Map')
    // sort by most recent as last (ASC)
    const txArray = [...txs.values()]
    txArray.sort(sorter)
    this._txs = new Map(txArray.map((tx) => [tx.txId, tx]))
    this._order = txArray.map((tx) => tx.txId)
    this.addresses = AddressSet.fromArray(txArray.flatMap((tx) => [...tx.addresses]))
  }

  static get [ModelIdSymbol]() {
    return 'TxSet'
  }

  static isInstance(instance) {
    return instance?.constructor?.[ModelIdSymbol] === this[ModelIdSymbol]
  }

  static fromArray(arr = []) {
    if (!Array.isArray(arr)) {
      console.warn(`Unexpected non-array value:`, arr)
      return TxSet.EMPTY
    }

    arr = arr.map((tx) => (tx instanceof Tx ? tx : Tx.fromJSON(tx)))

    const txs = new Map(arr.map((tx) => [tx.txId, tx]))
    return createTxSet({ txs })
  }

  // NOTE: subtle bug here, if new Tx is added with same ID, but slightly older date
  // will get replaced by current Tx object with same ID and not the one just added
  add(tx) {
    const oldTx = this.get(tx.txId)
    if (oldTx && sorter(oldTx, tx) > 0) {
      // Explicitly preserve bug from previous implementation to keep compatibility
      return this
    }

    const txs = new Map(this._txs)
    txs.set(tx.txId, tx)
    return createTxSet({ txs })
  }

  clone() {
    return createTxSet({ txs: new Map(this._txs) })
  }

  delete(tx) {
    const txObj = this.get(tx)
    if (!txObj) return this // nothing to remove
    const txs = new Map(this._txs)
    txs.delete(txObj.txId)
    return createTxSet({ txs })
  }

  // key txId comparison only
  equals(otherSet) {
    if (this._order.length !== otherSet._order.length) return false
    return this._order.every((item, i) => item === otherSet._order[i])
  }

  deepEquals(otherSet) {
    if (this === otherSet) return true
    if (this.size !== otherSet.size) return false

    for (let i = this.size - 1; i >= 0; i--) {
      const tx = this.getAt(i)
      const match = otherSet.get(tx)
      if (!match || !(tx === match || tx.equals(match))) {
        return false
      }
    }

    return true
  }

  get(tx) {
    return this._txs.get(String(tx))
  }

  getAt(order) {
    return this.get(this._order[order])
  }

  has(tx) {
    return this._txs.has(String(tx))
  }

  toJSON() {
    return [...this].map((tx) => tx.toJSON())
  }

  // TODO: consider merging txs together
  union(otherSet) {
    const arr1 = [...this]
    const arr2 = [...otherSet]
    const both = [...arr1, ...arr2]
    const newSet = TxSet.fromArray(both)
    if (this.deepEquals(newSet)) return this

    return newSet
  }

  // used from a rescan
  // TODO: optimize
  update(otherSet) {
    if (otherSet instanceof TxSet && otherSet.deepEquals(this)) return this

    // since we just iterate the new txs, implicitly we get rid of the txs that we have but didn't find
    const txs = new Map(
      [...otherSet].map((otherTx) => {
        const oldTx = this.get(otherTx.txId)
        const tx = { ...oldTx, ...otherTx }

        // coinAmount in the old one is the amount the user typed in the input box
        // in the (chain.so), it's the amount + fee
        if (oldTx) {
          // if signs are the same, we got the 'receive' or 'sent' part correct, if different, the rescan is correct
          if (
            Math.sign(tx.coinAmount.toDefaultNumber()) ===
              Math.sign(oldTx.coinAmount.toDefaultNumber()) && // only use old when signs are the same and there is no fee
            !tx.feeAmount
          )
            tx.coinAmount = oldTx.coinAmount

          // if old has meta, usually exchange data, like ShapeShift order number
          // TODO: if new has meta, should consider merging old meta and new meta
          // existence of meta field isn't enough IIRC, meta is set as an empty object
          if (oldTx.meta) {
            tx.meta = { ...oldTx.meta }
          }
        }

        const newTx = Tx.fromJSON(tx)
        return [newTx.txId, newTx]
      })
    )

    return createTxSet({ txs })
  }

  updateTxsProperties(items) {
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

    let balance
    this._mutations = [...this].map((tx) => {
      try {
        if (balance === undefined) balance = tx.coinAmount.unitType.ZERO

        // skip replaced tx by RBF
        if (!(tx.dropped || tx.data.replacedBy)) {
          if (!tx.error) {
            balance = balance.add(tx.coinAmount)
          }

          if (tx.feeAmount && tx.feeAmount.unitType.equals(tx.coinAmount.unitType)) {
            balance = balance.sub(tx.feeAmount)
          }
        }

        if (balance.isNegative && !mutationTxIdsWithWarning[tx.txId]) {
          console.warn('negative balance in mutations calculation', {
            tx,
            balance,
          })
          mutationTxIdsWithWarning[tx.txId] = tx.txId
        }

        return { tx, balance }
      } catch (e) {
        if (tx) {
          console.warn('failed to calculate mutation for tx', tx.toJSON())
          Object.assign(e, {
            asset: tx.coinName,
            extraInfo: JSON.stringify(tx.toJSON()),
          })
        }

        throw e
      }
    })
    return this._mutations
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
