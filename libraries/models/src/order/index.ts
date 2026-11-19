import assert from 'minimalistic-assert'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import NumberUnit, { isNumberUnit } from '@exodus/currency'
import { serialize, deserialize } from '../account-state/index.js'
import WalletAccount from '../wallet-account/index.js'
import { ModelIdSymbol } from '../constants.js'
import type { Asset } from '../types.js'
import { createIsInstance, omitUndefined } from '../utils.js'

const { get, isEqual, isPlainObject, isString } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils

function coerceToObject(obj: Order | Partial<OrderProps> | Partial<SerializedOrder>) {
  return obj instanceof Order ? obj.toJSON() : obj
}

const ERROR_STATUSES = {
  aero: ['failed', 'overdue', 'expired'],
  ch: ['failed', 'overdue', 'expired'],
  chf: ['failed', 'overdue', 'expired'],
  cic: ['failed', 'overdue', 'expired'],
  cn: ['failed', 'expired'],
  'inch-eth': ['failed'],
  'inch-bsc': ['failed'],
  'inch-matic': ['failed'],
  cs: ['failed', 'timeout'],
  csus: ['failed', 'timeout'],
  sw: ['failed', 'expired'],
  fa: ['cancelled'],
  he: ['failed', 'overdue', 'hold', 'expired'],
  fox: ['failed', 'timeout', 'unknown'],
  ne: ['canceled'],
  nrnb: ['overdue', 'error'],
}
const FAILED_STATUSES = {
  // end states, can't be changed, we stop checking
  aero: ['refunded'],
  ch: ['refunded'],
  chf: ['refunded'],
  cic: ['refunded'],
  cn: ['refunded'],
  cs: ['refunded'],
  csus: ['refunded'],
  sw: ['refunded'],
  fa: ['refunded'],
  he: ['refunded'],
  fox: ['cancelled'],
  ne: ['refunded'],
  nrnb: ['refunded'],
}

const OPTIMISTIC_STATUSES = new Set(['optimistic-complete', 'potential-complete'])

const FACTORY_SYMBOL = Symbol('Order')

export type OrderProps = {
  orderId: string
  appName?: string
  fromAmount?: NumberUnit
  toAmount?: NumberUnit
  status?: string
  errorDetails?: Record<string, any>
  date?: Date | string
  fromTxId?: string
  toTxId?: string
  txIds?: { txId: string; type?: string }[]
  potentialToTxIds?: string[]
  fromAsset?: string | Asset
  toAsset?: string | Asset
  fromWalletAccount?: string
  toWalletAccount?: string
  toAddress?: string
  svc?: string
  displaySvc?: string
  svcOptions?: Record<string, any>
  message?: string
  synced?: boolean
  region?: string
  slippage?: number
}

type SerializeNumberUnit = {
  t: 'numberunit'
  v: {
    v: string
    u: Record<string, number>
  }
}

export type SerializedOrder = Omit<OrderProps, 'fromAmount' | 'toAmount'> & {
  fromAmount?: SerializeNumberUnit
  toAmount?: SerializeNumberUnit
}

export type DenormalizedOrder = Omit<OrderProps, 'fromAmount' | 'toAmount'> & {
  fromAmount?: SerializeNumberUnit | NumberUnit
  toAmount?: SerializeNumberUnit | NumberUnit
}

// NOTE: should treat as immutable

export default class Order implements OrderProps {
  _version: number
  orderId: string
  appName?: string
  status: string
  errorDetails?: Record<string, any>
  fromTxId?: string
  toTxId?: string
  txIds?: { txId: string; type?: string }[]
  potentialToTxIds?: string[]
  date: Date
  fromAsset?: string
  toAsset?: string
  fromAmount?: NumberUnit
  toAmount?: NumberUnit
  fromWalletAccount?: string
  toWalletAccount?: string
  toAddress?: string
  svc: string
  displaySvc?: string
  svcOptions?: Record<string, any>
  message?: string
  synced?: boolean
  region?: string
  slippage?: number

  constructor(props: OrderProps, initSymbol: typeof FACTORY_SYMBOL) {
    assert(initSymbol === FACTORY_SYMBOL, 'please use Order.fromJSON()')

    this.orderId = props.orderId
    assert(typeof this.orderId === 'string', `orderId must be a string, received: ${this.orderId}`)

    if (typeof props.appName === 'string') this.appName = props.appName

    if (props.fromAmount !== undefined && !isNumberUnit(props.fromAmount)) {
      throw new Error('fromAmount must be of type: NumberUnit')
    }

    if (props.toAmount !== undefined && !isNumberUnit(props.toAmount)) {
      throw new Error('toAmount must be of type: NumberUnit')
    }

    this.status = props.status || ''
    if (props.errorDetails) this.errorDetails = props.errorDetails

    this.date = props.date
      ? props.date instanceof Date
        ? props.date
        : new Date(props.date)
      : new Date()

    if (props.fromTxId) this.fromTxId = props.fromTxId
    if (props.toTxId) this.toTxId = props.toTxId
    if (props.txIds) this.txIds = props.txIds

    if (props.fromAsset) this.fromAsset = String(props.fromAsset)
    if (props.fromAmount) this.fromAmount = props.fromAmount

    if (props.toAsset) this.toAsset = String(props.toAsset)
    if (props.toAmount) this.toAmount = props.toAmount

    this.fromWalletAccount = props.fromWalletAccount || WalletAccount.DEFAULT_NAME
    // TODO: Ideally remove DEFAULT_NAME fallback for toWalletAccount when toAddress is set,
    // but removing toWalletAccount may break some UI
    this.toWalletAccount = props.toWalletAccount || WalletAccount.DEFAULT_NAME
    // Third-party swap withdraws: stores the external address when user swaps to a non-wallet address
    if (props.toAddress) this.toAddress = props.toAddress

    // service provider:
    if (!props.svc) console.log(`${props.orderId} has no 'svc' field set.`)
    this.svc = props.svc || 'ss'

    if (props.svcOptions) this.svcOptions = props.svcOptions

    // remote message for customers
    if (props.message !== undefined && props.message !== 'null') this.message = props.message

    // true if the order exists in fusion
    if (typeof props.synced === 'boolean') this.synced = props.synced

    if (typeof props.region === 'string') this.region = props.region

    if (typeof props.displaySvc === 'string') this.displaySvc = props.displaySvc

    this.slippage = props.slippage
    this.toTxId = props.toTxId
    this.potentialToTxIds = props.potentialToTxIds || []

    this._version = 1
  }

  static get [ModelIdSymbol]() {
    return 'Order'
  }

  // can't assign directly to [Symbol.hasInstance] due to a babel bug
  // can't use this in static initializers due to another babel bug
  static _isInstance = createIsInstance(Order)
  static [Symbol.hasInstance](x: any) {
    return this._isInstance(x)
  }

  /**
   * @deprecated Use `instanceof` instead.
   */
  static isInstance = Order[Symbol.hasInstance]

  static fromJSON(json: string | DenormalizedOrder | SerializedOrder) {
    assert(
      json && (isString(json) || isPlainObject(json)),
      'fromJSON: requires a string or a plain object'
    )

    const data = typeof json === 'string' ? JSON.parse(json) : json

    const fromAmount = data.fromAmount ? deserialize(data.fromAmount) : undefined
    const toAmount = data.toAmount ? deserialize(data.toAmount) : undefined

    return new Order({ ...data, fromAmount, toAmount }, FACTORY_SYMBOL)
  }

  inspect() {
    return `[Order ${this.orderId}]`
  }

  toJSON() {
    const obj = { ...this, date: this.date.toISOString() }

    if (obj.fromAmount) obj.fromAmount = serialize(obj.fromAmount)
    if (obj.toAmount) obj.toAmount = serialize(obj.toAmount)
    obj._version = 1

    return omitUndefined(obj) as SerializedOrder
  }

  toRedactedJSON() {
    const fromAmount = this.fromAmount ? serialize(this.fromAmount) : undefined
    const toAmount = this.toAmount ? serialize(this.toAmount) : undefined

    return omitUndefined({
      orderId: this.orderId,
      appName: this.appName,
      date: this.date.toISOString(),
      displaySvc: this.displaySvc,
      fromAmount,
      fromAsset: this.fromAsset,
      fromWalletAccount: this.fromWalletAccount,
      hasError: this.errorDetails && Object.keys(this.errorDetails).length > 0,
      message: this.message,
      region: this.region,
      slippage: this.slippage,
      status: this.status,
      svc: this.svc,
      synced: this.synced,
      toAddress: this.toAddress,
      toAmount,
      toAsset: this.toAsset,
      toWalletAccount: this.toWalletAccount,
    })
  }

  // @deprecated
  toJSONLegacy() {
    console.log(
      'Order: calling deprecated function order.toJSONLegacy(), use orderToJSONLegacy() instead'
    )

    const obj: Partial<this> = {
      ...this,
      date: this.date.toISOString(),
      ...(this.fromAmount && { fromAmount: this.fromAmount.toDefaultString({ unit: true }) }),
      ...(this.toAmount && { toAmount: this.toAmount.toDefaultString({ unit: true }) }),
    }

    delete obj._version

    return obj
  }

  equals(other: Order): boolean {
    if (this === other) return true
    return (
      this.orderId === other.orderId &&
      this.appName === other.appName &&
      this.status === other.status &&
      this.synced === other.synced &&
      this.toTxId === other.toTxId &&
      this.fromTxId === other.fromTxId &&
      this.message === other.message &&
      this.fromAsset === other.fromAsset &&
      this.toAsset === other.toAsset &&
      this.fromWalletAccount === other.fromWalletAccount &&
      this.toWalletAccount === other.toWalletAccount &&
      this.toAddress === other.toAddress &&
      this.svc === other.svc &&
      this.displaySvc === other.displaySvc &&
      this.region === other.region &&
      this.slippage === other.slippage &&
      this.date.getTime() === other.date.getTime() &&
      (this.fromAmount === other.fromAmount ||
        (this.fromAmount instanceof NumberUnit &&
          other.fromAmount instanceof NumberUnit &&
          this.fromAmount.equals(other.fromAmount))) &&
      (this.toAmount === other.toAmount ||
        (this.toAmount instanceof NumberUnit &&
          other.toAmount instanceof NumberUnit &&
          this.toAmount.equals(other.toAmount))) &&
      isEqual(this.errorDetails, other.errorDetails) &&
      isEqual(this.svcOptions, other.svcOptions) &&
      isEqual(this.potentialToTxIds, other.potentialToTxIds) &&
      isEqual(this.txIds, other.txIds)
    )
  }

  toString() {
    return String(this.orderId)
  }

  update(fields: Partial<OrderProps | SerializedOrder> | Order) {
    const data = coerceToObject(fields)

    return Order.fromJSON({ ...this.toJSON(), ...data })
  }

  get displayStatus() {
    if (this.status === 'delayed') return 'delayed'

    return this.exodusStatus
  }

  // this.status is the raw field provided by the exchange service
  // exodusStatus is used to map to the interface, customer only
  // cares if an exchange is in progress, complete, or failed... nothing else
  get exodusStatus() {
    if (this.status === 'e2e-syncing') return 'syncing'
    if (this.status === 'complete-verified') return 'complete'
    if (this.status === 'failed-final') return 'failed'

    if (get(FAILED_STATUSES, this.svc, [] as string[]).includes(this.status)) return 'failed'

    return 'in-progress'
  }

  get error() {
    if (get(ERROR_STATUSES, this.svc, [] as string[]).includes(this.status)) return true
    if (get(FAILED_STATUSES, this.svc, [] as string[]).includes(this.status)) return true

    return this.status === 'failed-final'
  }

  get finalized() {
    return ['failed-final', 'complete-verified'].includes(this.status)
  }

  get floatingRate() {
    return this.svc === 'ch' && this.status !== 'complete-verified'
  }

  get hasOptimisticStatus() {
    return OPTIMISTIC_STATUSES.has(this.status)
  }

  get exchangeApp() {
    return this.svc === 'ftx' ? 'ftx' : 'exodus'
  }
}
