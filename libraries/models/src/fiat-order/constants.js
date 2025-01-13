export const ORDER_TYPES = {
  __proto__: null,
  buy: 'buy',
  sell: 'sell',
}

export const ORDER_STATUS = {
  __proto__: null,
  complete: 'complete',
  failed: 'failed',
  in_progress: 'in-progress',
  initiated: 'initiated',
}

export const PROVIDERS = {
  __proto__: null,
  blockchain: 'blockchain',
  moonpay: 'moonpay',
  onramper: 'onramper',
  paypal: 'paypal',
  ramp: 'ramp',
  sardine: 'sardine',
}

export const MOONPAY_ORDER_STATUS = {
  __proto__: null,
  completed: 'completed',
  failed: 'failed',
  pending: 'pending',
  waiting_authorization: 'waitingAuthorization',
  waiting_deposit: 'waitingForDeposit',
  waiting_payment: 'waitingPayment',
}

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
}

export const PAYPAL_ORDER_STATUS = {
  __proto__: null,
  completed: 'COMPLETED',
  failed: 'FAILED',
  initiated: 'INITIATED',
  pending: 'PENDING',
}

export const ORDER_STATUS_TO_PAYPAL_STATUS = {
  __proto__: null,
  [ORDER_STATUS.complete]: [PAYPAL_ORDER_STATUS.completed],
  [ORDER_STATUS.failed]: [PAYPAL_ORDER_STATUS.failed],
  [ORDER_STATUS.in_progress]: [PAYPAL_ORDER_STATUS.pending],
  [ORDER_STATUS.initiated]: [PAYPAL_ORDER_STATUS.initiated],
}

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
}

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
}

export const SARDINE_ORDER_STATUS = {
  __proto__: null,
  complete: 'Complete',
  declined: 'Declined',
  draft: 'Draft',
  expired: 'Expired',
  processed: 'Processed',
  user_custody: 'UserCustody',
}

export const ORDER_STATUS_TO_SARDINE_STATUS = {
  __proto__: null,
  [ORDER_STATUS.complete]: [SARDINE_ORDER_STATUS.complete],
  [ORDER_STATUS.failed]: [SARDINE_ORDER_STATUS.declined, SARDINE_ORDER_STATUS.expired],
  [ORDER_STATUS.in_progress]: [
    SARDINE_ORDER_STATUS.draft,
    SARDINE_ORDER_STATUS.user_custody,
    SARDINE_ORDER_STATUS.processed,
  ],
}

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
}

export const ONRAMPER_ORDER_STATUS = {
  __proto__: null,
  new: 'new',
  pending: 'pending',
  paid: 'paid',
  completed: 'completed',
  canceled: 'canceled',
  failed: 'failed',
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
}

export const STALE_STATUS = {
  __proto__: null,
  [PROVIDERS.blockchain]: BLOCKCHAIN_ORDER_STATUS.failed,
  [PROVIDERS.onramper]: ONRAMPER_ORDER_STATUS.failed,
  [PROVIDERS.ramp]: RAMP_ORDER_STATUS.expired,
  [PROVIDERS.paypal]: PAYPAL_ORDER_STATUS.failed,
  [PROVIDERS.moonpay]: MOONPAY_ORDER_STATUS.failed,
  [PROVIDERS.sardine]: SARDINE_ORDER_STATUS.expired,
}

export const COMPLETE_STATUS = {
  __proto__: null,
  [PROVIDERS.blockchain]: BLOCKCHAIN_ORDER_STATUS.completed,
  [PROVIDERS.onramper]: ONRAMPER_ORDER_STATUS.completed,
  [PROVIDERS.ramp]: RAMP_ORDER_STATUS.released,
  [PROVIDERS.paypal]: PAYPAL_ORDER_STATUS.completed,
  [PROVIDERS.moonpay]: MOONPAY_ORDER_STATUS.completed,
  [PROVIDERS.sardine]: SARDINE_ORDER_STATUS.complete,
}

export const STATUS_MAP = {
  __proto__: null,
  [PROVIDERS.blockchain]: ORDER_STATUS_TO_BLOCKCHAIN_STATUS,
  [PROVIDERS.onramper]: ORDER_STATUS_TO_ONRAMPER_STATUS,
  [PROVIDERS.moonpay]: ORDER_STATUS_TO_MOONPAY_STATUS,
  [PROVIDERS.paypal]: ORDER_STATUS_TO_PAYPAL_STATUS,
  [PROVIDERS.ramp]: ORDER_STATUS_TO_RAMP_STATUS,
  [PROVIDERS.sardine]: ORDER_STATUS_TO_SARDINE_STATUS,
}
