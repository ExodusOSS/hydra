import { formatSwapActivity } from './format-swap-activity'
import { formatTxActivity } from './format-tx-activity'

export const formattersByType = new Map([
  ['exchange', formatSwapActivity],
  ['tx', formatTxActivity],
])
