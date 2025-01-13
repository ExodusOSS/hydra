import assets from '@exodus/assets-base'

export const BTC_TX_AMOUNT_NUMBER = 0.0015
export const BTC_TX_AMOUNT = assets.bitcoin.currency.defaultUnit(BTC_TX_AMOUNT_NUMBER)
export const BTC_TX_AMOUNT_NEGATIVE = BTC_TX_AMOUNT.negate()

const TX_ERROR = {
  error: 'error',
  failed: true,
  coinAmount: BTC_TX_AMOUNT,
}

const TX_OUTGOING_ERROR = {
  error: 'error',
  failed: true,
  coinAmount: BTC_TX_AMOUNT_NEGATIVE,
}

const TX_UNCONFIRMED = {
  pending: true,
  coinAmount: BTC_TX_AMOUNT,
}

const TX_UNCONFIRMED_NEGATIVE = {
  pending: true,
  sent: true,
  coinAmount: BTC_TX_AMOUNT_NEGATIVE,
}

const TX_CONFIRMED = {
  confirmations: 1,
  coinAmount: BTC_TX_AMOUNT,
}

const TX_CONFIRMED_NEGATIVE = {
  confirmations: -1,
  coinAmount: BTC_TX_AMOUNT,
}

export const TX_LOG = new Set([
  TX_ERROR,
  TX_OUTGOING_ERROR,
  TX_UNCONFIRMED,
  TX_UNCONFIRMED_NEGATIVE,
  TX_CONFIRMED,
  TX_CONFIRMED_NEGATIVE,
])
