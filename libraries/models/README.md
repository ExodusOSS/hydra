# `@exodus/models`

This library contains a variety of classes/models used for various data structures.

## Installation/Usage

```bash
yarn add @exodus/models
```

This library exports each model as a named export:

```js
import { Address, AddressSet } from '@exodus/models'
```

## Models

All models have a static method `.isInstance(obj)` which returns `true` if `obj` is an instance of the model. This check returns `true` even if the instance is of a duplicate, different version of the model; for this reason it should be used instead of the `instanceof` operator.

### [`AccountState`](./src/account-state/index.js)

A base class from which all asset account state clases extend. Cannot be initialized directly.

### [`Address`](./src/address/index.js)

A model for blockchain addresses.

### [`AddressSet`](./src/address-set/index.js)

An immutable set of `Address`es with sorting functionality.

### [`FiatOrder`](./src/fiat-order/index.js)

A model for fiat orders.

### [`FiatOrderSet`](./src/fiat-order-set/index.js)

An immutable set of `FiatOrder`s, with alternate get methods like `getAt`, `getByTxId`, & `getAllByTxId`, and an `.update(orders)` method for updating details of existing orders.

### [`Order`](./src/order/index.js)

A model for crypto swap orders.

### [`OrderSet`](./src/order-set/index.js)

An immutable set of `Order`s, with alternate get methods like `getAt`, `getByTxId`, & `getAllByTxId`, and an `.update(orders)` method for updating details of existing orders.

### [`PersonalNote`](./src/personal-note/index.js)

A model for personal notes.

### [`PersonalNoteSet`](./src/personal-note-set/index.js)

An immutable set of `PersonalNote`s. Unlike other `*Set` models, the `.add()` & `.update()` methods return the same `PersonalNoteSet` instance if there were no changes to the data.

### [`Tx`](./src/tx/index.js)

A model for blockchain transactions.

### [`TxSet`](./src/tx-set/index.js)

An immutable set of `Tx`s. Cannot be constructed directly, either start with `TxSet.EMPTY` or use the static method `TxSet.fromArray()`. `txSet.equals(otherSet)` only compares transaction ids; use `txSet.deepEquals(otherSet)` for full transaction comparison.

### [`UtxoCollection`](./src/utxo-collection/index.js)

An immutable colletion of UTXOs, with various methods for filtering, updating, and selecting from them.

### [`WalletAccount`](./src/wallet-account/index.js)

An immutable model for representing wallet accounts of all sources.

### [`WalletAccountSet`](./src/wallet-account-set/index.js)

A minimal, immutable set of `WalletAccount`s.
