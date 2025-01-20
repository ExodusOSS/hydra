import type { Feature } from '@exodus/dependency-types'

import transactionsApiDefinition from './api.js'
import transactionsDefinition from './module.js'

const transactions = () =>
  ({
    id: 'transactions',
    definitions: [
      { definition: transactionsDefinition },
      { definition: transactionsApiDefinition },
      {
        definition: {
          id: 'txSend',
          type: 'module',
          factory: ({ transactions }) => transactions.send,
          dependencies: ['transactions'],
          public: true,
        },
      },
    ],
  }) satisfies Feature

export default transactions
