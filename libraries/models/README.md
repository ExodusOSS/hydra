# `@exodus/models`

Containers for common business objects in the wild world of Exodus wallets. These typically provide basic functions like immutability (mutator methods return new instances), validation, serialization, and comparison.

Containers for collections typically have convenience methods for accessing elements by some semantic parameters, and merging with other collections. These tend to be specific to the collected business object.

## Installation/Usage

```bash
yarn add @exodus/models
```

This library exports each model as a named export. Usage example:

```js
import { WalletAccount } from '@exodus/models'

const investments = new WalletAccount({
  source: WalletAccount.EXODUS_SRC,
  index: 0,
  label: 'Not investment advice',
})

const updatedInvestments = investments.update({ label: 'Still not investment advice' })
investments.equals(updatedInvestments) // false
WalletAccount.isInstance(investments) // true

investments.toJSON() // serialize for storage
WalletAccount.fromJSON(investments.toJSON()) // deserialize from storage

const safeInvestments = new WalletAccount({
  id: '1234', // comes from device
  source: WalletAccount.TREZOR_SRC,
  index: 0,
  label: 'Really not investment advice',
})
```

Collection usage example:

```js
const myPortfolios = new WalletAccountSet({ [investments]: investments })
const myUpdatedPortfolios = myPortfolios.update({ [safeInvestments]: safeInvestments })
myUpdatedPortfolios.toJSON() // serialize for storage
```

See more examples in model-specific tests.

## Shared Interfaces

All models have a static method `.isInstance(obj)` which returns `true` if `obj` is an instance of the model. This check returns `true` even if the instance is of a model from a different version of the `@exodus/models` package, and should be preferred to the `instanceof` operator.

### [`AccountState`](./src/account-state/index.ts)

Container for an asset's blockchain state, like balance, token balances, utxos, etc. This is a base class from which all asset-specific account state classes extend. It cannot be initialized directly.

### [`Address`](./src/address/index.ts)

Container for a blockchain address string and associated metadata, such as the [KeyIdentifier](https://www.npmjs.com/package/@exodus/key-identifier) for that address.

### [`AddressSet`](./src/address-set/index.ts)

Collection of `Address`es.

### [`FiatOrder`](./src/fiat-order/index.ts)

Container for data relating to a fiat <-> crypto purchase or sale.

### [`FiatOrderSet`](./src/fiat-order-set/index.ts)

Collection of `FiatOrder`s.

### [`Order`](./src/order/index.ts)

Container for data relating to the exchange of one crypto asset for another.

### [`OrderSet`](./src/order-set/index.ts)

Collection of `Order`s.

### [`PersonalNote`](./src/personal-note/index.ts)

Container for a user's personal note for a transaction, e.g. "pizza"

### [`PersonalNoteSet`](./src/personal-note-set/index.ts)

A collection of `PersonalNote`s.

### [`Tx`](./src/tx/index.ts)

Container for data relating to a blockchain transaction, such as the transaction id, amount, confirmations, source address(es), destination address(es), and others.

### [`TxSet`](./src/tx-set/index.ts)

Collection of `Tx`s. It cannot be constructed directly, so either start with `TxSet.EMPTY` or use the static method `TxSet.fromArray()`. Note: `txSet.equals(otherSet)` only compares transaction ids; use `txSet.deepEquals(otherSet)` for full transaction comparison.

### [`UtxoCollection`](./src/utxo-collection/index.ts)

Collection of UTXOs. There is no corresponding `UTXO` model. Use `utxoCollection.select(amount, feeEstimator)` to select utxos for a given amount you want to send.

### [`WalletAccount`](./src/wallet-account/index.ts)

Container for a [bip44 account index](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#path-levels) and user-specific portfolio metadata. Slightly counterintuitively, if you're looking at the bip44 path, in Exodus wallets each portfolio corresponds to a basket of assets, i.e. both of the following paths will correspond to a single portfolio`

- `m/44'/0'/7'/0/0`: first bitcoin address of portfolio 7
- `m/44'/60'/7'/0/0`: first ethereum address of portfolio 7

### [`WalletAccountSet`](./src/wallet-account-set/index.ts)

Collection of `WalletAccount`s.
