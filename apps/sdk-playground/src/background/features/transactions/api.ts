import type { Definition } from '@exodus/dependency-types'

const createTransactionsApi = ({ transactions }) => {
  return {
    transactions: {
      send: transactions.send,
      broadcast: transactions.broadcast,
    },
  }
}

const transactionsApiDefinition = {
  id: 'transactionsApi',
  type: 'api',
  factory: createTransactionsApi,
  dependencies: [
    //
    'transactions',
  ],
} as const satisfies Definition

export default transactionsApiDefinition
