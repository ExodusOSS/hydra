import type apiDefinition from './api/index.js'

declare const exportTransactions: () => {
  id: 'exportTransactions'
  definitions: [{ definition: typeof apiDefinition }]
}

export default exportTransactions
