# @exodus/export-transactions

## Usage

To use the module call the factory and pass in required dependencies

```ts
import { create as createExportTransactions } from '@exodus/export-transactions'

const exportTransactions = createExportTransactions({
  assetsModule,
  blockchainMetadata,
  enabledWalletAccountsAtom,
  multipleWalletAccountsEnabledAtom,
  personalNotesAtom,
  ordersAtom,
  logger,
})

const exportedTxs = await exportTransactions.exportForWalletAccount(walletAccount)

// generating the CSV is handled by the clients
```
