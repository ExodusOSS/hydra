import getSelectorDefinition from './get'
import getBatchSelectorDefinition from './get-batch'
import moneroSendTxsSelectorDefinition from './monero-send-txs'
import withBatchIdSelectorDefinition from './with-batch-id'

export default [
  getSelectorDefinition,
  getBatchSelectorDefinition,
  moneroSendTxsSelectorDefinition,
  withBatchIdSelectorDefinition,
]
