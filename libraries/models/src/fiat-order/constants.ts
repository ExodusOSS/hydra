type WithoutProto<T extends object> = T extends { __proto__: any } ? Omit<T, '__proto__'> : T
export type Values<T extends object | any[]> = WithoutProto<T>[keyof WithoutProto<T>]

export const ORDER_TYPES = {
  __proto__: null,
  buy: 'buy',
  sell: 'sell',
} as const

export type OrderType = Values<typeof ORDER_TYPES>

export const ORDER_STATUS = {
  __proto__: null,
  complete: 'complete',
  failed: 'failed',
  in_progress: 'in-progress',
} as const

export type OrderStatus = Values<typeof ORDER_STATUS>

export const PROVIDERS = {
  __proto__: null,
  alchemypay: 'alchemypay',
  banxa: 'banxa',
  binancep2p: 'binancep2p',
  blockchain: 'blockchain',
  btcdirect: 'btcdirect',
  coinify: 'coinify',
  dfx: 'dfx',
  fonbnk: 'fonbnk',
  gateconnect: 'gateconnect',
  gatefi: 'gatefi',
  guardarian: 'guardarian',
  koywe: 'koywe',
  localramp: 'localramp',
  moonpay: 'moonpay',
  neocrypto: 'neocrypto',
  onramper: 'onramper',
  onrampmoney: 'onrampmoney',
  paypal: 'paypal',
  ramp: 'ramp',
  revolut: 'revolut',
  sardine: 'sardine',
  skrill: 'skrill',
  stripe: 'stripe',
  topper: 'topper',
  transfi: 'transfi',
  utorg: 'utorg',
  xopay: 'xopay',
} as const

export type Provider = Values<typeof PROVIDERS>

export const MOONPAY_ORDER_STATUS = {
  __proto__: null,
  completed: 'completed',
  failed: 'failed',
  pending: 'pending',
  waiting_authorization: 'waitingAuthorization',
  waiting_deposit: 'waitingForDeposit',
  waiting_payment: 'waitingPayment',
} as const

export const ORDER_STATUS_TO_MOONPAY_STATUS = {
  __proto__: null,
  [ORDER_STATUS.complete]: [MOONPAY_ORDER_STATUS.completed],
  [ORDER_STATUS.failed]: [MOONPAY_ORDER_STATUS.failed],
  [ORDER_STATUS.in_progress]: [
    MOONPAY_ORDER_STATUS.waiting_payment,
    MOONPAY_ORDER_STATUS.pending,
    MOONPAY_ORDER_STATUS.waiting_authorization,
    MOONPAY_ORDER_STATUS.waiting_deposit,
  ],
} as const

export const PAYPAL_ORDER_STATUS = {
  __proto__: null,
  completed: 'COMPLETED',
  failed: 'FAILED',
  initiated: 'INITIATED',
  pending: 'PENDING',
} as const

export const ORDER_STATUS_TO_PAYPAL_STATUS = {
  __proto__: null,
  [ORDER_STATUS.complete]: [PAYPAL_ORDER_STATUS.completed],
  [ORDER_STATUS.failed]: [PAYPAL_ORDER_STATUS.failed],
  [ORDER_STATUS.in_progress]: [PAYPAL_ORDER_STATUS.initiated, PAYPAL_ORDER_STATUS.pending],
} as const

export const RAMP_ORDER_STATUS = {
  __proto__: null,
  cancelled: 'CANCELLED',
  expired: 'EXPIRED',
  fiat_received: 'FIAT_RECEIVED',
  fiat_sent: 'FIAT_SENT',
  initialized: 'INITIALIZED',
  payment_executed: 'PAYMENT_EXECUTED',
  payment_failed: 'PAYMENT_FAILED',
  payment_in_progress: 'PAYMENT_IN_PROGRESS',
  payment_started: 'PAYMENT_STARTED',
  released: 'RELEASED',
  releasing: 'RELEASING',
  review_rejected: 'REVIEW_REJECTED',
} as const

export const ORDER_STATUS_TO_RAMP_STATUS = {
  __proto__: null,
  [ORDER_STATUS.complete]: [RAMP_ORDER_STATUS.released],
  [ORDER_STATUS.failed]: [
    RAMP_ORDER_STATUS.cancelled,
    RAMP_ORDER_STATUS.expired,
    RAMP_ORDER_STATUS.payment_failed,
    RAMP_ORDER_STATUS.review_rejected,
  ],
  [ORDER_STATUS.in_progress]: [
    RAMP_ORDER_STATUS.fiat_received,
    RAMP_ORDER_STATUS.fiat_sent,
    RAMP_ORDER_STATUS.initialized,
    RAMP_ORDER_STATUS.payment_executed,
    RAMP_ORDER_STATUS.payment_in_progress,
    RAMP_ORDER_STATUS.payment_started,
    RAMP_ORDER_STATUS.releasing,
  ],
} as const

export const SARDINE_ORDER_STATUS = {
  __proto__: null,
  complete: 'Complete',
  declined: 'Declined',
  draft: 'Draft',
  expired: 'Expired',
  processed: 'Processed',
  user_custody: 'UserCustody',
} as const

export const ORDER_STATUS_TO_SARDINE_STATUS = {
  __proto__: null,
  [ORDER_STATUS.complete]: [SARDINE_ORDER_STATUS.complete],
  [ORDER_STATUS.failed]: [SARDINE_ORDER_STATUS.declined, SARDINE_ORDER_STATUS.expired],
  [ORDER_STATUS.in_progress]: [
    SARDINE_ORDER_STATUS.draft,
    SARDINE_ORDER_STATUS.user_custody,
    SARDINE_ORDER_STATUS.processed,
  ],
} as const

export const BLOCKCHAIN_ORDER_STATUS = {
  __proto__: null,
  completed: 'COMPLETED',
  failed: 'FAILED',
  pending: 'PENDING',
  withdrawing: 'WITHDRAWING',
}

export const ORDER_STATUS_TO_BLOCKCHAIN_STATUS = {
  __proto__: null,
  [ORDER_STATUS.complete]: [BLOCKCHAIN_ORDER_STATUS.completed],
  [ORDER_STATUS.failed]: [BLOCKCHAIN_ORDER_STATUS.failed],
  [ORDER_STATUS.in_progress]: [
    BLOCKCHAIN_ORDER_STATUS.pending,
    BLOCKCHAIN_ORDER_STATUS.withdrawing,
  ],
} as const

export const ONRAMPER_ORDER_STATUS = {
  __proto__: null,
  new: 'new',
  pending: 'pending',
  paid: 'paid',
  completed: 'completed',
  canceled: 'canceled',
  failed: 'failed',
} as const

export type StatusByProvider = {
  alchemypay: Values<typeof ONRAMPER_ORDER_STATUS>
  banxa: Values<typeof ONRAMPER_ORDER_STATUS>
  binancep2p: Values<typeof ONRAMPER_ORDER_STATUS>
  btcdirect: Values<typeof ONRAMPER_ORDER_STATUS>
  coinify: Values<typeof ONRAMPER_ORDER_STATUS>
  dfx: Values<typeof ONRAMPER_ORDER_STATUS>
  fonbnk: Values<typeof ONRAMPER_ORDER_STATUS>
  gateconnect: Values<typeof ONRAMPER_ORDER_STATUS>
  gatefi: Values<typeof ONRAMPER_ORDER_STATUS>
  guardarian: Values<typeof ONRAMPER_ORDER_STATUS>
  koywe: Values<typeof ONRAMPER_ORDER_STATUS>
  localramp: Values<typeof ONRAMPER_ORDER_STATUS>
  neocrypto: Values<typeof ONRAMPER_ORDER_STATUS>
  onrampmoney: Values<typeof ONRAMPER_ORDER_STATUS>
  revolut: Values<typeof ONRAMPER_ORDER_STATUS>
  skrill: Values<typeof ONRAMPER_ORDER_STATUS>
  stripe: Values<typeof ONRAMPER_ORDER_STATUS>
  topper: Values<typeof ONRAMPER_ORDER_STATUS>
  transfi: Values<typeof ONRAMPER_ORDER_STATUS>
  utorg: Values<typeof ONRAMPER_ORDER_STATUS>
  blockchain: Values<typeof BLOCKCHAIN_ORDER_STATUS>
  moonpay: Values<typeof MOONPAY_ORDER_STATUS>
  onramper: Values<typeof ONRAMPER_ORDER_STATUS>
  paypal: Values<typeof PAYPAL_ORDER_STATUS>
  ramp: Values<typeof RAMP_ORDER_STATUS>
  sardine: Values<typeof SARDINE_ORDER_STATUS>
  xopay: Values<typeof XOPAY_ORDER_STATUS>
}

export const ORDER_STATUS_TO_ONRAMPER_STATUS = {
  __proto__: null,
  [ORDER_STATUS.complete]: [ONRAMPER_ORDER_STATUS.completed],
  [ORDER_STATUS.failed]: [ONRAMPER_ORDER_STATUS.failed, ONRAMPER_ORDER_STATUS.canceled],
  [ORDER_STATUS.in_progress]: [
    ONRAMPER_ORDER_STATUS.new,
    ONRAMPER_ORDER_STATUS.paid,
    ONRAMPER_ORDER_STATUS.pending,
  ],
} as const

export const XOPAY_ORDER_STATUS = {
  __proto__: null,
  completed: 'COMPLETED',
  error: 'ERROR',
  failed: 'FAILED',
  in_progress: 'IN_PROGRESS',
} as const

export const ORDER_STATUS_TO_XOPAY_STATUS = {
  __proto__: null,
  [ORDER_STATUS.complete]: [XOPAY_ORDER_STATUS.completed],
  [ORDER_STATUS.failed]: [XOPAY_ORDER_STATUS.error, XOPAY_ORDER_STATUS.failed],
  [ORDER_STATUS.in_progress]: [XOPAY_ORDER_STATUS.in_progress],
} as const

export const STALE_STATUS = {
  __proto__: null,
  [PROVIDERS.blockchain]: BLOCKCHAIN_ORDER_STATUS.failed,
  [PROVIDERS.onramper]: ONRAMPER_ORDER_STATUS.failed,
  [PROVIDERS.ramp]: RAMP_ORDER_STATUS.expired,
  [PROVIDERS.paypal]: PAYPAL_ORDER_STATUS.failed,
  [PROVIDERS.moonpay]: MOONPAY_ORDER_STATUS.failed,
  [PROVIDERS.sardine]: SARDINE_ORDER_STATUS.expired,
  [PROVIDERS.xopay]: XOPAY_ORDER_STATUS.failed,
} as const

export const COMPLETE_STATUS = {
  __proto__: null,
  [PROVIDERS.blockchain]: BLOCKCHAIN_ORDER_STATUS.completed,
  [PROVIDERS.onramper]: ONRAMPER_ORDER_STATUS.completed,
  [PROVIDERS.ramp]: RAMP_ORDER_STATUS.released,
  [PROVIDERS.paypal]: PAYPAL_ORDER_STATUS.completed,
  [PROVIDERS.moonpay]: MOONPAY_ORDER_STATUS.completed,
  [PROVIDERS.sardine]: SARDINE_ORDER_STATUS.complete,
  [PROVIDERS.xopay]: XOPAY_ORDER_STATUS.completed,
} as const

export const STATUS_MAP = {
  __proto__: null,
  [PROVIDERS.alchemypay]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.banxa]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.blockchain]: ORDER_STATUS_TO_BLOCKCHAIN_STATUS,
  [PROVIDERS.binancep2p]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.btcdirect]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.coinify]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.dfx]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.fonbnk]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.gateconnect]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.gatefi]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.guardarian]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.koywe]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.localramp]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.moonpay]: ORDER_STATUS_TO_MOONPAY_STATUS,
  [PROVIDERS.neocrypto]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.onramper]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.onrampmoney]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.paypal]: ORDER_STATUS_TO_PAYPAL_STATUS,
  [PROVIDERS.ramp]: ORDER_STATUS_TO_RAMP_STATUS,
  [PROVIDERS.revolut]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.sardine]: ORDER_STATUS_TO_SARDINE_STATUS,
  [PROVIDERS.skrill]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.stripe]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.topper]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.transfi]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.utorg]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.xopay]: ORDER_STATUS_TO_XOPAY_STATUS,
} as const
