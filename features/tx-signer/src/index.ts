import {
  transactionSignerDefinition,
  seedBasedTransactionSignerDefinition,
} from './module/index.js'
import transactionSignerApiDefinition from './api/index.js'

const transactionSigner = () => {
  return {
    id: 'transactionSigner',
    definitions: [
      {
        definition: transactionSignerDefinition,
      },
      {
        definition: seedBasedTransactionSignerDefinition,
      },
      {
        definition: transactionSignerApiDefinition,
      },
    ],
  } as const
}

export default transactionSigner
