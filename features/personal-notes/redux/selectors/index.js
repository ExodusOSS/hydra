import getSelectorDefinition from './get.js'
import getBatchSelectorDefinition from './get-batch.js'
import moneroSendTxsSelectorDefinition from './monero-send-txs.js'
import withBatchIdSelectorDefinition from './with-batch-id.js'

export default [
  getSelectorDefinition,
  getBatchSelectorDefinition,
  moneroSendTxsSelectorDefinition,
  withBatchIdSelectorDefinition,
]
