import { formatSwapActivity } from './format-swap-activity.js'
import { formatTxActivity } from './format-tx-activity.js'

export const formattersByType = new Map([
  ['exchange', formatSwapActivity],
  ['tx', formatTxActivity],
])
