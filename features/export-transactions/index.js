import exportTransactionsDefinition from './module'
import exportTransactionsApiDefinition from './api'

const exportTransactions = () => ({
  id: 'exportTransactions',
  definitions: [
    { definition: exportTransactionsDefinition },
    { definition: exportTransactionsApiDefinition },
  ],
})

export default exportTransactions
