import assert from 'minimalistic-assert'
import Address from '../address/index.js'
import AddressSet from '../address-set/index.js'
import type { UnitType } from '@exodus/currency'
import type NumberUnit from '@exodus/currency'
import { isNumberUnit } from '@exodus/currency'
import lodash from 'lodash'
import { ModelIdSymbol } from '../constants.js'
import type Tx from '../tx/index.js'
import { createIsInstance } from '../utils.js'

const { differenceBy, groupBy, isEqual, sortBy, uniq, uniqBy } = lodash

// NOTE: Immutable data collection.
// TODO: optimize, consider performance implications of Object.freeze

export type Utxo = {
  address: Address
  confirmations: number
  rbfEnabled?: boolean
  txId: string
  vout: number
  value: NumberUnit
  script?: string | null
}

export type RawUtxo = Omit<Utxo, 'value' | 'address'> & {
  value: string | NumberUnit
  address?: Address
}

function pickCurrencyFromArray(utxos: RawUtxo[] | null | undefined) {
  if (!Array.isArray(utxos)) return
  for (const utxo of utxos) {
    if (typeof utxo.value === 'object' && utxo.value.unitType) return utxo.value.unitType
  }
}

type AddressMap = Record<string, Address>

type ConstructorParams = {
  currency?: UnitType
}

export type UtxoCollectionJson = Record<string, { address: string; path: string; utxos: RawUtxo[] }>

export default class UtxoCollection {
  readonly currency?: UnitType
  private _data: Record<string, Utxo[]> | null = null
  private _addresses?: AddressSet
  private _value?: NumberUnit
  private _size?: number

  // never call with 'new' outside of this class
  constructor({ currency }: ConstructorParams = Object.create(null)) {
    this.currency = currency
  }

  static get [ModelIdSymbol]() {
    return 'UtxoCollection'
  }

  static isInstance = createIsInstance(UtxoCollection)

  static [Symbol.hasInstance](instance: unknown): instance is UtxoCollection {
    return this.isInstance(instance)
  }

  static createEmpty(
    options: ConstructorParams & { addressMap?: AddressMap } = Object.create(null)
  ) {
    return UtxoCollection.fromArray([], options)
  }

  static fromArray(
    utxoArray: RawUtxo[] | null | undefined,
    { addressMap, ...options }: ConstructorParams & { addressMap?: AddressMap } = Object.create(
      null
    )
  ) {
    const currency = options.currency || pickCurrencyFromArray(utxoArray)
    // may cause bugs later
    if (currency == null && utxoArray == null) {
      console.warn('UtxoCollection.fromArray(): both currency and utxoArray are null.')
    } else if (currency == null && utxoArray?.length === 0) {
      console.warn('UtxoCollection.fromArray(): currency is null and utxoArray has zero items.')
    }

    // filter out duplicates
    utxoArray = uniqBy(utxoArray, (utxo) => `${utxo.txId}:${utxo.vout}`)

    const utxos = utxoArray.map((utxo) => {
      assert(utxo.address, 'utxo.address must be provided')
      assert(
        utxo.address instanceof Address || addressMap,
        'Must pass addressMap if utxo.address is not of type Address'
      )
      utxo.address = utxo.address instanceof Address ? utxo.address : addressMap![utxo.address]! // eslint-disable-line @exodus/mutable/no-param-reassign-prop-only
      return {
        ...utxo,
        value: isNumberUnit(utxo.value) ? utxo.value : currency!.parse(utxo.value as string),
      } as Utxo
    })

    const col = new UtxoCollection({ currency })
    col._data = Object.freeze(groupBy(utxos, (utxo) => utxo.address.toString()))
    return col
  }

  static fromJSON(json: UtxoCollectionJson | string, { currency }: { currency: UnitType }) {
    const data = typeof json === 'string' ? JSON.parse(json) : json

    const utxoData: Record<string, Utxo[]> = Object.create(null)
    Object.keys(data).forEach((address) => {
      const addr = new Address(data[address].address, { path: data[address].path })

      // sort by smallest -> to largest
      const sortedUtxos = sortBy(data[address].utxos, (utxo) =>
        currency.parse(utxo.value).toDefaultNumber()
      )
      utxoData[address] = sortedUtxos.map((utxo) => ({
        ...utxo,
        address: addr,
        value: currency.parse(utxo.value),
      }))
    })

    const col = new UtxoCollection({ currency })
    col._data = Object.freeze(utxoData)
    return col
  }

  clone() {
    return UtxoCollection.fromArray(this.toArray(), { ...this })
  }

  equals(utxoCol: UtxoCollection) {
    return isEqual(this.toJSON(), utxoCol.toJSON())
  }

  // TODO: decide, compliment or symmetric difference
  // i.e => (A - B) or... (A - B) U (B - A) therefore, you could call A.difference(B) or
  // B.difference(A)
  // current implementation does A - B
  difference(utxoCol: UtxoCollection) {
    const txMap = (col: UtxoCollection) => {
      const map: Record<string, Utxo> = Object.create(null)
      col.toArray().forEach((utxo) => {
        const key = `${utxo.txId}/${utxo.vout}`
        map[key] = utxo
      })
      return map
    }

    const thisMap = txMap(this)
    const otherMap = txMap(utxoCol)

    const retUtxos: Utxo[] = []
    Object.keys(thisMap).forEach((key) => {
      if (!otherMap[key]) retUtxos.push(thisMap[key]!)
    })

    return UtxoCollection.fromArray(retUtxos, { ...this })
  }

  getAddressUtxos(address: string | Address) {
    assert(address.toString() in this._data!, `${address} is not present in this UTXO collection`)
    return UtxoCollection.fromArray(this._data![address.toString()]!, { ...this })
  }

  getTxIdUtxos(txId: string) {
    const arrUtxos = this.toArray().filter((utxo) => utxo.txId === txId)
    return UtxoCollection.fromArray(arrUtxos, { ...this })
  }

  getAddressesForTxId(txId: string) {
    const arrUtxos = this.toArray().filter((utxo) => utxo.txId === txId)
    const arrAddrs = arrUtxos.map((utxo) => utxo.address)
    return AddressSet.fromArray(arrAddrs)
  }

  /**
   * @deprecated
   */
  getAddressPathsMap() {
    return [...this.addresses].reduce((obj, addr) => {
      return Object.assign(obj, { [addr.toString()]: addr.meta.path })
    }, Object.create(null))
  }

  hasAddressUtxos(address: string) {
    return String(address) in this._data!
  }

  inspect() {
    return `<UtxoCollection size: ${this.size}, value: ${this.value!.toDefaultString()}>`
  }

  isEmpty() {
    return this._data == null || Object.keys(this._data).length === 0
  }

  // any utxos associated with an address replace current address utxos
  // the use case is from checking a blockchain API
  // future use case: SPV and then would need to merge individual utxos
  merge(utxoCol: UtxoCollection) {
    let currentUtxos: UtxoCollection = this // eslint-disable-line unicorn/no-this-assignment, @typescript-eslint/no-this-alias
    for (const address of utxoCol.addresses) {
      currentUtxos = currentUtxos.setAddressUtxos(address, utxoCol.getAddressUtxos(address))
    }

    return currentUtxos
  }

  removeAddressUtxos(address: Address | string) {
    const newData = { ...this._data }
    delete newData[address.toString()]
    const col = new UtxoCollection({ ...this })
    col._data = Object.freeze(newData)
    return col
  }

  // NOTE: dust checking is not handled here, it's handled
  // TODO: this algorithm is very naive right now. May want to consider optimizations akin to CS Knapsack Problem
  select(amount: NumberUnit, feeEstimator: (options: { inputs: UtxoCollection }) => NumberUnit) {
    const emptyUtxoCol = UtxoCollection.createEmpty({ currency: this.currency })
    if (amount.gt(this.value!)) return [emptyUtxoCol, this.clone()]

    const selectFromGroup = (utxos: UtxoCollection, minimumAmount: NumberUnit) => {
      let selected = emptyUtxoCol
      let remaining = emptyUtxoCol
      if (utxos.size === 0) return [selected, remaining]

      // sort smallest to highest
      // if BTC, sort confirmed before unconfirmed, then smallest to highest
      // this keeps wallet fragmentation low, but keeps fees higher
      const arrUtxos =
        minimumAmount.defaultUnit.unitName === 'BTC'
          ? sortBy(
              utxos.toArray(),
              (utxo) => !utxo.confirmations,
              (utxo) => utxo.value.toDefaultNumber()
            )
          : sortBy(utxos.toArray(), (utxo) => utxo.value.toDefaultNumber())
      const selectedUtxos = []
      const currency = arrUtxos[0]!.value.unitType

      let sum = currency.ZERO
      for (const utxo of arrUtxos) {
        selectedUtxos.push(utxo)
        sum = sum.add(utxo.value)

        if (sum.gte(minimumAmount)) {
          selected = UtxoCollection.fromArray(selectedUtxos, { ...this })
          remaining = utxos.difference(selected)
          return [selected, remaining]
        }
      }

      selected = UtxoCollection.fromArray(selectedUtxos, { ...this })
      remaining = utxos.difference(selected)
      return [selected, remaining]
    }

    // NOTE: commenting to simplify UTXO handling. Will worry about merge avoidance + privacy later.
    // we don't have multiple receive or exchange addresses yet, so this is premature anyways
    /*
    let addrs = this.addresses
    if (addrs.length > 1) {
      for (let addr of addrs) {
        let addrUtxos = this.getAddressUtxos(addr)
        if (addrUtxos.value.gte(amount)) {
          // only returns selected and remaining from address grouping
          let [selected, remaining] = selectFromGroup(addrUtxos)
          const newRemaining = this.setAddressUtxos(addr, remaining)
          return [selected, newRemaining]
        }
      }
    }
    */

    let [selected, remaining] = selectFromGroup(this, amount)

    const fee = feeEstimator({ inputs: selected! })
    const total = amount.add(fee)

    /*
    console.log('UTXO SELECTION:')
    console.log(`AMOUNT ${amount}`)
    console.log(`FEE ${fee}`)
    console.log(`TOTAL ${total}`)
    console.log(`SELECTED ${selected.value}`)
    */

    if (total.gt(selected!.value!)) {
      if (total.lte(this.value!)) {
        const newFee = feeEstimator({ inputs: remaining! })
        const newTotal = total.add(newFee)
        // if newFee is the difference between selecting selected + (remaining - x), just select all
        if (newTotal.gte(this.value!)) return [this, emptyUtxoCol]

        const [feeSelected, feeRemaining] = selectFromGroup(remaining!, fee.add(newFee))
        remaining = feeRemaining
        selected = selected!.union(feeSelected!)
      } else {
        return [emptyUtxoCol, this] // can't do it
      }
    }

    return [selected, remaining]
  }

  updateConfirmations(txs: Tx[]) {
    return UtxoCollection.fromArray(
      this.toArray().map((utxo) => {
        const tx = txs.find((tx) => tx.txId === utxo.txId)
        if (tx) utxo.confirmations = tx.confirmations // eslint-disable-line @exodus/mutable/no-param-reassign-prop-only
        return utxo
      }),
      { ...this }
    )
  }

  addUtxo(utxo: Utxo, addressMap: AddressMap) {
    return UtxoCollection.fromArray([...this.toArray(), utxo], { addressMap })
  }

  setAddressUtxos(
    address: string | Address,
    utxos: Utxo[] | UtxoCollection,
    { addressMap }: { addressMap?: AddressMap } = Object.create(null)
  ) {
    if (Array.isArray(utxos)) {
      if (utxos.length === 0) return this.removeAddressUtxos(address)
      return UtxoCollection.fromArray(utxos, { ...this, addressMap })
    }

    assert(utxos instanceof UtxoCollection, 'utxos must be an Array or UtxoCollection')
    if (utxos.size === 0) return this.removeAddressUtxos(address)

    const newUtxos = { ...this._data, [address.toString()]: utxos.toArray() }
    const col = new UtxoCollection({ ...this })
    col._data = Object.freeze(newUtxos)
    return col
  }

  toArray(): Utxo[] {
    return Object.values(this._data!).flat()
  }

  toPriorityOrderedArray(descending = false) {
    return sortBy(
      this.toArray(),
      (utxo) => !utxo.confirmations && utxo.rbfEnabled,
      (utxo) => !utxo.confirmations,
      (utxo) => utxo.value.toDefaultNumber() * (descending ? -1 : 1)
    )
  }

  toJSON() {
    const jsonMap: Record<
      string,
      {
        address: string
        path: string
        utxos: (Omit<Utxo, 'value' | 'address'> & { value: string })[]
      }
    > = Object.create(null)
    ;[...this.addresses].forEach((addr) => {
      const address = addr.toString()
      const sortedUtxos = sortBy(this._data![address], (utxo) => utxo.value.toDefaultNumber())
      jsonMap[address] = {
        address,
        path: addr.meta.path,
        utxos: sortedUtxos.map(({ value, address: _address, ...rest }) => {
          return { ...rest, value: value.toDefaultString({ unit: true }) }
        }),
      }
    })

    return jsonMap
  }

  // does not overwrite exiting data
  union(utxos: UtxoCollection) {
    const arr1 = this.toArray()
    const arr2 = utxos.toArray()
    return UtxoCollection.fromArray([...arr1, ...arr2], { ...this })
  }

  // does not overwrite exiting data
  filter(predicate: (utxo: Utxo) => boolean) {
    return UtxoCollection.fromArray(this.toArray().filter(predicate), { ...this })
  }

  // overwrite existing data
  unionOverwrite(utxos: UtxoCollection) {
    const arr1 = this.toArray()
    const arr2 = utxos.toArray()
    const prunedArr1 = differenceBy(arr1, arr2, (utxo) => `${utxo.txId}:${utxo.vout}`)
    const utxoArray = [...prunedArr1, ...arr2]
    return UtxoCollection.fromArray(utxoArray, { ...this })
  }

  get addresses() {
    if (this._addresses) return this._addresses

    const addrs: Address[] = []
    Object.entries(this._data!).forEach(([addr, utxos]) => {
      if (!Array.isArray(utxos)) return
      if (utxos.length === 0) return
      addrs.push(utxos[0]!.address || Address.create(addr))
    })

    // condition shouldn't happen, but just in case
    if (addrs.length === 0) {
      this._addresses = AddressSet.EMPTY
      return this._addresses
    }

    addrs.sort(AddressSet.PATH_SORTER)

    this._addresses = AddressSet.fromArray(addrs)
    return this._addresses
  }

  // TODO: DEPRECATE
  get empty() {
    return this._data == null || Object.keys(this._data).length === 0
  }

  get size() {
    if (typeof this._size === 'number') return this._size
    this._size = this.toArray().length
    return this._size
  }

  get txIds() {
    return uniq(this.toArray().map((utxo) => utxo.txId))
  }

  get value() {
    // Since a UtxoCollection is immutable, this is memoized
    if (this._value) return this._value

    this._value = this.toArray().reduce((sum, utxo) => sum.add(utxo.value), this.currency!.ZERO)
    return this._value
  }

  *[Symbol.iterator]() {
    // TODO: change when modifying to an ES Map
    const arr = this.toArray()
    for (const val of arr) yield val
  }
}
