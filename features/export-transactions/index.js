import exportTransactionsDefinition from './module/index.js'
import exportTransactionsApiDefinition from './api/index.js'

const exportTransactions = () => ({
  id: 'exportTransactions',
  definitions: [
    { definition: exportTransactionsDefinition },
    { definition: exportTransactionsApiDefinition },
  ],
})

export default exportTransactions
