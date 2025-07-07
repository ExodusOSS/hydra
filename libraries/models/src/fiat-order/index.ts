import NumberUnit, { isNumberUnit } from '@exodus/currency'
import assert from 'minimalistic-assert'
import lodash from 'lodash'

import { type StatusByProvider, type Provider, ORDER_TYPES, STATUS_MAP } from './constants.js'
import { serialize, deserialize } from '../account-state/index.js'
import { isOrderAmountLegacyDefaultUnitString, isOrderAmountLegacyNumber } from './utils.js'
import { ModelIdSymbol } from '../constants.js'
import type { Assets } from '../types.js'
import { createIsInstance, omitUndefined } from '../utils.js'

const { isEqual } = lodash

const coerceToObject = <T extends FiatOrder<any> | Partial<FiatOrderProps<any>>>(obj: T) =>
  obj instanceof FiatOrder ? obj.toJSON() : obj

export const fusionOrderToOrderAdapter = <P extends Provider>(
  order: Omit<FiatOrderProps<P>, 'date' | 'fromAmount'> & {
    date: string | Date
    fromAmount: number | string | NumberUnit | null
  },
  assets: Assets
) => {
  if (!assets) {
    throw new Error('assets is required')
  }

  const result = { ...order }
  const isBuy = order.orderType === ORDER_TYPES.buy
  const cryptoAsset = isBuy ? order.toAsset : order.fromAsset
  const cryptoAmount = isBuy ? order.toAmount : order.fromAmount
  const cryptoCurrency = assets[cryptoAsset].currency

  const serializedCryptoAmount =
    !cryptoAmount || isOrderAmountLegacyNumber(cryptoAmount)
      ? serialize(cryptoCurrency.defaultUnit(cryptoAmount ?? 0))
      : isOrderAmountLegacyDefaultUnitString(cryptoAmount)
        ? serialize(cryptoCurrency.parse(cryptoAmount))
        : cryptoAmount

  result.fromAmount = isBuy ? order.fromAmount : serializedCryptoAmount
  result.toAmount = isBuy ? serializedCryptoAmount : order.toAmount

  return result
}

type AdapterParams = {
  createdAt: Date
  fee?: number
  from: {
    amount: number
    asset: string
  }
  id: string
  networkFee?: number
  paymentMethodType?: string
  provider: Provider
  providerId: string
  rate: number
  status: string
  subProvider?: string
  subProviderId?: string
  to: {
    amount: number
    asset: string
  }
  totalFee?: number
  txId?: string
  type: string
  walletAccount: string
  walletAddress: string
}

export const adapter = (
  {
    createdAt,
    fee = 0,
    from,
    id,
    networkFee = 0,
    paymentMethodType,
    provider,
    providerId,
    rate,
    status,
    subProvider,
    subProviderId,
    to,
    totalFee = 0,
    txId,
    type,
    walletAccount,
    walletAddress,
  }: AdapterParams,
  assets: Assets
) => {
  if (!assets) {
    throw new Error('assets is required')
  }

  const isBuy = type === ORDER_TYPES.buy
  const fiat = isBuy ? from : to
  const crypto = isBuy ? to : from
  const cryptoAsset = assets[crypto.asset]
  const cryptoAmount = serialize(cryptoAsset.currency.defaultUnit(crypto?.amount || 0))

  return {
    date: createdAt,
    exodusRate: rate, // Use the same as `providerRate` since we don't provide EUR/GBP prices
    fees: {
      networkFee,
      providerFee: fee,
      processingFee: 0,
      totalFee,
    },
    fiatValue: fiat.amount,
    fromAddress: isBuy ? null : walletAddress,
    fromAmount: isBuy ? fiat.amount : cryptoAmount,
    fromAsset: from.asset,
    fromWalletAccount: isBuy ? null : walletAccount,
    orderId: id,
    orderType: type,
    paymentMethodType,
    provider,
    providerOrderId: providerId,
    providerRate: rate,
    subProvider,
    subProviderOrderId: subProviderId,
    status,
    toAddress: isBuy ? walletAddress : null,
    toAmount: isBuy ? cryptoAmount : fiat.amount,
    toAsset: to.asset,
    toWalletAccount: isBuy ? walletAccount : null,
    txId,
  }
}

const FACTORY_SYMBOL = Symbol('FiatOrder')

export type FiatOrderProps<P extends Provider = Provider> = {
  date: Date
  exodusRate: number
  fees?: {
    networkFee: number
    providerFee: number
    processingFee: number
    totalFee: number
  }
  fiatValue: number
  fromAddress: string | null
  fromAmount: number | NumberUnit
  fromAsset: string
  fromWalletAccount: string | null
  orderId: string
  orderType: string
  paymentMethodType?: string
  provider: P
  status: StatusByProvider[P]
  providerOrderId?: string
  providerRate: number
  subProvider?: string
  subProviderOrderId?: string
  toAddress: string | null
  toAmount: number | NumberUnit
  toAsset: string
  toWalletAccount: string | null
  txId?: string
  feesWereSubsidized?: boolean
  hideInHistory?: boolean
  showedFailureBanner?: boolean
  errorMessage?: string
  supportMessage?: string
}

export default class FiatOrder<P extends Provider = Provider> implements FiatOrderProps<P> {
  errorMessage?: string
  provider!: P
  status!: StatusByProvider[P]
  date!: Date
  exodusRate!: number
  fiatValue!: number
  fromAddress!: string | null
  fromAmount!: number | NumberUnit
  fromAsset!: string
  fromWalletAccount!: string | null
  orderId!: string
  orderType!: string
  providerOrderId?: string
  providerRate!: number
  subProvider!: string
  subProviderOrderId!: string
  toAddress!: string | null
  toAmount!: number | NumberUnit
  toAsset!: string
  toWalletAccount!: string | null
  txId?: string
  fees?: { networkFee: number; providerFee: number; processingFee: number; totalFee: number }
  feesWereSubsidized?: boolean
  hideInHistory?: boolean
  showedFailureBanner?: boolean
  supportMessage?: string
  paymentMethodType?: string

  constructor(props: FiatOrderProps<P>, initSymbol: typeof FACTORY_SYMBOL) {
    FiatOrder.validate(props, initSymbol)
    Object.assign(this, props)

    // old orders may have both exoduStatus 'complete' and an 'errorMessage'
    if (this.exodusStatus === 'complete' && this.errorMessage) {
      delete this.errorMessage
    }
  }

  static get [ModelIdSymbol]() {
    return 'FiatOrder'
  }

  static isInstance = createIsInstance(FiatOrder)

  static [Symbol.hasInstance](instance: unknown): instance is FiatOrder {
    return this.isInstance(instance)
  }

  #matches(fields: Partial<FiatOrderProps>) {
    const props = Object.keys(fields) as (keyof FiatOrderProps)[]
    return props.every((key) => {
      const value = fields[key]

      if (value instanceof Date) {
        return (this[key] as Date | null)?.toISOString() === value.toISOString()
      }

      if (isNumberUnit(value)) {
        return (this[key] as NumberUnit | undefined)?.equals(value as NumberUnit)
      }

      return isEqual(this[key], fields[key])
    })
  }

  static validate = (order: Partial<FiatOrderProps>, initSymbol: typeof FACTORY_SYMBOL) => {
    assert(initSymbol === FACTORY_SYMBOL, 'please use Order.fromJSON()')
    assert(typeof order.orderId === 'string', 'expected string "orderId"')
    assert(
      ['buy', 'sell'].includes(order.orderType!),
      'expected "orderType" of value "buy" | "sell"'
    )
    assert(
      typeof order.provider === 'string' && STATUS_MAP[order.provider as keyof typeof STATUS_MAP],
      'invalid provider'
    )
    assert(typeof order.status === 'string', 'expected string "status"')
    assert(
      typeof order.fromAddress === 'string' || order.fromAddress === null,
      'expected string or null "fromAddress"'
    )
    assert(
      typeof order.fromWalletAccount === 'string' || order.fromWalletAccount === null,
      'expected string or null "fromWalletAccount"'
    )
    assert(
      typeof order.fromAmount === 'number' || order.fromAmount instanceof NumberUnit,
      'expected number or NumberUnit "fromAmount"'
    )
    assert(typeof order.fromAsset === 'string', 'expected string "fromAsset"')
    assert(
      typeof order.toAddress === 'string' || order.toAddress === null,
      'expected string or null "toAddress"'
    )
    assert(
      typeof order.toWalletAccount === 'string' || order.toWalletAccount === null,
      'expected string or null "toWalletAccount"'
    )
    assert(
      typeof order.toAmount === 'number' || order.toAmount instanceof NumberUnit,
      'expected number or NumberUnit "toAmount"'
    )
    assert(typeof order.toAsset === 'string', 'expected string "toAsset"')
    assert(typeof order.fiatValue === 'number', 'expected number "fiatValue"')
    assert(typeof order.providerRate === 'number', 'expected number "providerRate"')
    assert(typeof order.exodusRate === 'number', 'expected number "exodusRate"')
    if (order.feesWereSubsidized !== undefined) {
      assert(typeof order.feesWereSubsidized === 'boolean', 'expected boolean "feesWereSubsidized"')
    }

    if (order.errorMessage) {
      assert(typeof order.errorMessage === 'string', 'expected string "errorMessage"')
    }

    if (order.fees) {
      assert(typeof order.fees === 'object', 'expected object "fees"')
    }

    if (order.hideInHistory !== undefined) {
      assert(typeof order.hideInHistory === 'boolean', 'expected boolean "hideInHistory"')
    }

    if (order.supportMessage != null) {
      assert(typeof order.supportMessage === 'string', 'expected string "supportMessage"')
    }

    if (order.showedFailureBanner !== undefined) {
      assert(
        typeof order.showedFailureBanner === 'boolean',
        'expected boolean "showedFailureBanner"'
      )
    }
  }

  get exodusStatus() {
    const statuses = STATUS_MAP[this.provider as keyof typeof STATUS_MAP]! ?? {}
    const match = Object.entries(statuses).find(([, providerStatuses]) =>
      providerStatuses.includes(this.status)
    )

    return match ? match[0] : 'in-progress'
  }

  get error() {
    return !!this.errorMessage
  }

  get isBuy() {
    return this.orderType === 'buy'
  }

  get isSell() {
    return this.orderType === 'sell'
  }

  get cryptoAmount() {
    return this.isBuy ? this.toAmount : this.fromAmount
  }

  get cryptoAsset() {
    return this.isBuy ? this.toAsset : this.fromAsset
  }

  get txIds() {
    return this.txId ? [this.txId] : []
  }

  static fromJSON<P extends Provider>(
    order: Omit<FiatOrderProps<P>, 'date'> & { date: string | Date }
  ) {
    const isBuy = order.orderType === ORDER_TYPES.buy

    return new FiatOrder(
      {
        ...order,
        date: order.date instanceof Date ? order.date : new Date(order.date),
        ...(isBuy
          ? { toAmount: deserialize(order.toAmount) }
          : { fromAmount: deserialize(order.fromAmount) }),
      },
      FACTORY_SYMBOL
    )
  }

  equals(fields: Partial<FiatOrderProps> | FiatOrder) {
    const data = coerceToObject(fields)
    const fieldsToCheck = new Set(Object.keys(data))
    const existingFields = new Set(Object.keys(this.toJSON()))

    const keysMatch =
      existingFields.size === fieldsToCheck.size &&
      [...existingFields].every((field) => fieldsToCheck.has(field))

    return keysMatch ? this.#matches(fields) : false
  }

  inspect() {
    return `[${this.constructor.name} ${this.orderId}]`
  }

  toJSON() {
    const json = {
      ...this,
      date: this.date.toISOString(),
      ...(this.isBuy
        ? { toAmount: serialize(this.toAmount) }
        : { fromAmount: serialize(this.fromAmount) }),
    }

    return omitUndefined(json)
  }

  toRedactedJSON() {
    return omitUndefined({
      cryptoAmount: isNumberUnit(this.cryptoAmount)
        ? serialize(this.cryptoAmount)
        : this.cryptoAmount,
      cryptoAsset: this.cryptoAsset,
      date: this.date.toISOString(),
      exodusRate: this.exodusRate,
      exodusStatus: this.exodusStatus,
      fees: this.fees,
      fiatValue: this.fiatValue,
      fromAmount: isNumberUnit(this.fromAmount) ? serialize(this.fromAmount) : this.fromAmount,
      fromAsset: this.fromAsset,
      isBuy: this.isBuy,
      isSell: this.isSell,
      orderId: this.orderId,
      orderType: this.orderType,
      paymentMethodType: this.paymentMethodType,
      provider: this.provider,
      providerOrderId: this.providerOrderId,
      providerRate: this.providerRate,
      subProvider: this.subProvider,
      subProviderOrderId: this.subProviderOrderId,
      status: this.status,
      toAddress: this.toAddress,
      toAmount: isNumberUnit(this.toAmount) ? serialize(this.toAmount) : this.toAmount,
      toAsset: this.toAsset,
      toWalletAccount: this.toWalletAccount,
      txIds: this.txIds,
    })
  }

  toString() {
    return this.orderId
  }

  update(fields: Partial<FiatOrderProps> | FiatOrder) {
    const data = coerceToObject(fields)
    if (this.#matches(data)) {
      return this
    }

    return FiatOrder.fromJSON({ ...this.toJSON(), ...data })
  }
}
