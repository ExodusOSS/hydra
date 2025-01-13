import NumberUnit, { isNumberUnit } from '@exodus/currency'
import assert from 'minimalistic-assert'
import lodash from 'lodash'

import { ORDER_TYPES, STATUS_MAP } from './constants.js'
import { serialize, deserialize } from '../account-state/index.js'
import { isOrderAmountLegacyDefaultUnitString, isOrderAmountLegacyNumber } from './utils.js'
import { ModelIdSymbol } from '../constants.js'

const { isEqual } = lodash

export const fusionOrderToOrderAdapter = (order, assets) => {
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

export const adapter = (
  {
    createdAt,
    fee = 0,
    from,
    id,
    networkFee = 0,
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
  },
  assets
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

export default class FiatOrder {
  constructor(props, initSymbol) {
    FiatOrder.validate(props, initSymbol)
    Object.assign(this, props)

    // old orders may have both exoduStatus 'complete' and an 'errorMessage'
    if (this.exodusStatus === 'complete' && this.errorMessage) {
      console.log('ignoring error given error complete')
      delete this.errorMessage
    }
  }

  static get [ModelIdSymbol]() {
    return 'FiatOrder'
  }

  static isInstance(instance) {
    return instance?.constructor?.[ModelIdSymbol] === this[ModelIdSymbol]
  }

  #matches(fields) {
    return Object.keys(fields).every((key) => {
      const value = fields[key]

      if (value instanceof Date) {
        return this[key].toISOString() === value.toISOString()
      }

      if (isNumberUnit(value)) {
        return this[key]?.equals(value)
      }

      return isEqual(this[key], fields[key])
    })
  }

  static validate = (order, initSymbol) => {
    assert(initSymbol === FACTORY_SYMBOL, 'please use Order.fromJSON()')
    assert(typeof order.orderId === 'string', 'expected string "orderId"')
    assert(
      ['buy', 'sell'].includes(order.orderType),
      'expected "orderType" of value "buy" | "sell"'
    )
    assert(typeof order.provider === 'string' && STATUS_MAP[order.provider], 'invalid provider')
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
    const statuses = STATUS_MAP[this.provider]
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

  static fromJSON(order) {
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

  equals(fields) {
    const fieldsToCheck = new Set(Object.keys(fields))
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
    return {
      ...this,
      date: this.date.toISOString(),
      ...(this.isBuy
        ? { toAmount: serialize(this.toAmount) }
        : { fromAmount: serialize(this.fromAmount) }),
    }
  }

  toString() {
    return this.orderId
  }

  update(fields) {
    if (this.#matches(fields)) {
      return this
    }

    return FiatOrder.fromJSON({ ...this.toJSON(), ...fields })
  }
}
