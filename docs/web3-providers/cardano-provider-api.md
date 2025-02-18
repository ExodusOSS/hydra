---
sidebar_position: 6
---

# Cardano Provider API

Exodus injects a global API into websites visited by its users at
`window.exodus.cardano` and also at `window.cardano.exodus`, as specified by
[CIP-30](https://cips.cardano.org/cips/cip30/#initialapi).

## Methods

### `cardano.exodus.isEnabled()`

```typescript
cardano.exodus.isEnabled(): Promise<boolean>
```

Returns `true` if the provider is connected to the app or `false` otherwise.

### `cardano.exodus.enable()`

```typescript
type Address = string // bech32 format.

interface CollateralParams = {
  amount: string // CBOR encoded.
}

interface Paginate = {
  page?: number
  limit?: number
}

interface DataSignature = {
  signature: string
  key: string
}

type TransactionUnspentOutput = string // CBOR encoded.

type TransactionWitnessSet = string // CBOR encoded.

type Transaction = string // CBOR encoded.

interface ApiMethods {
  getBalance: () => Promise<string> // CBOR encoded.
  getChangeAddress: () => Promise<Address>
  getCollateral: (params?: CollateralParams) => Promise<TransactionUnspentOutput[] | null>
  getNetworkId: () => Promise<number>
  getRewardAddresses: () => Promise<Address[]>
  getUnusedAddresses: () => Promise<Address[]>
  getUsedAddresses: (paginate?: Paginate) => Promise<Address[]>
  getUtxos: (amount?: string, paginate?: Paginate) => Promise<TransactionUnspentOutput[] | null>
  signData: (address: Address, payload: string) => Promise<DataSignature>
  signTx: (transaction: Transaction, partialSign = false) => Promise<TransactionWitnessSet>
  submitTx: (transaction: Transaction) => Promise<string>
}

cardano.exodus.enable(): Promise<ApiMethods>
```

Use `cardano.exodus.enable()` to request access to the user's account. This will
open a pop-up asking the user to approve the connection. Upon approval, Exodus
will return an object containing the full API.

#### Example

```typescript
try {
  const api: ApiMethods = await window.cardano.exodus.enable()
} catch (err) {
  // { code: -3, message: 'The request was refused due to lack of access - e.g. wallet disconnects.' }
}
```

### `api.getBalance()`

```typescript
api.getBalance(): Promise<string> // CBOR encoded
```

Returns the total balance available in the wallet. This is the same as summing
the result of all the UTXOS (unspent transaction outputs) amount returned after
calling `api.getUtxos()`. This method also returns the balance of any custom
tokens present in the wallet.

### `api.getChangeAddress()`

```typescript
type Address = string // bech32 format.

api.getChangeAddress(): Promise<Address>
```

Returns an address from the wallet that can be used to return the leftover
balance during a transaction. This can also be used for generic receive address
as well.

### `api.getCollateral(options)`

```typescript
interface CollateralParams {
  amount: string // `bignumber` or `number` CBOR encoded.
}

type TransactionUnspentOutput = string // CBOR encoded.

api.getCollateral(params?: CollateralParams): Promise<TransactionUnspentOutput[] | null>
```

This returns a list of one or more UTXOs (unspent transaction outputs). This is
used as collateral inputs for transactions with plutus script inputs. The
`params` parameter is optional and used for specifying the desired `amount`,
which determines the `TransactionUnspentOutput` returned as collateral. The
total collateral returned will always be equal to or greater than the specified
`amount`. If the specified `amount` is not met, `null` will be returned.

### `api.getRewardAddresses()`

```typescript
type Address = string // bech32 format.

api.getRewardAddresses(): Promise<Address[]>
```

Returns an array of reward addresses of the user's account. The returned
`Address` is in hex-encoded format.

### `api.getUsedAddresses(paginate?: Paginate)`

```typescript
interface Paginate = {
  page?: number
  limit?: number
}

type Address = string // bech32 format.

api.getUsedAddresses(paginate?: Paginate): Promise<Address[]>
```

Returns a list of all used addresses of the connected account. The results can
be further paginated by providing a `paginate` param (page and limit).

### `api.getUnusedAddresses()`

```typescript
type Address = string // bech32 format.

api.getUnusedAddresses(): Promise<Address[]>
```

Returns a list of unused addresses of the connected user's account. The returned
`Address` is in bech32 format.

### `api.getUtxos(amount, paginate)`

```typescript
type TransactionUnspentOutput = string // CBOR encoded.

interface Paginate = {
  page?: number
  limit?: number
}

// `amount` must be CBOR encoded if provided which can either be in `bignumber` or `number` format (before encoding)
api.getUtxos(amount?: string, paginate?: Paginate): Promise<TransactionUnspentOutput[] | null>
```

If `amount` is not defined (i.e `undefined`), this shall return a list of all
UTXOs (unspent transaction outputs) of the user's account. If `amount` is
defined, this request shall be limited to just the UTXOs that are required to
reach the combined ADA/multiasset value target specified in `amount`, and if
this cannot be attained, `null` shall be returned. The results can be further
paginated by providing the `page` number and `limit`. The returned result is an
array of hex-encoded UTXOs (`TransactionUnspentOutput`).

#### Example

```typescript
const amount = CBOR.encode(1000000) // 1 ADA.
const paginate = {
  page: 1,
  limit: 10,
}

const utxos = await api.getUtxos(amount, paginate)
// ['8282582062e...5a6c011a001e8480', '82825820db1b0a1...a6c011a001e8480']
```

### `api.getNetworkId()`

```typescript
api.getNetworkId(): Promise<number>
```

Returns the network ID of the currently connected account (`1` is mainnet).

### `api.signData(address, payload)`

```typescript
type Address = string // bech32 or hex-encoded format.

interface DataSignature {
  signature: string
  key: string
}

// `payload` must be CBOR encoded.
api.signData(address: Address, payload: string): Promise<DataSignature>
```

Use `api.signData()` to request the Exodus user to sign an arbitrary message
(`payload`). The `payload` must be a `utf8` hex-encoded string and `address` can
either be hex or bech32 format. If successful, it returns a Promise that
resolves to the `signature` of the `payload` using
[CIP-0008 signing spec](https://github.com/cardano-foundation/CIPs/blob/master/CIP-0008/README.md)
and `key` that can be used to verify the signature.

#### Example

```typescript
const address =
  '019f1843817ea637addf7ee2de4eda95ec16a65ae42e2a20227a5a6c019f1843817ea637addf7ee2de4eda95ec16a65ae42e2a20227a5a6c01'
const payload =
  '57656c636f6d6520746f20434e46542e696f2c20736563726574206d65737...3486b684942485a39465a6e58526e6a6b6'

const dataSignature = await api.signData(address, payload)
```

### `api.signTx(transaction, partialSign)`

```typescript
type Transaction = string // CBOR encoded.

type TransactionWitnessSet = string // CBOR encoded.

api.signTx(transaction: Transaction, partialSign?: boolean): Promise<TransactionWitnessSet>
```

Use `signTx` to request the Exodus user sign the unsigned portions of the
supplied transaction. The `transaction` param should be in hex-encoded format.
If `partialSign` is `true`, Exodus only tries to sign what it can but if
`partialSign` is `false` and Exodus cannot sign the entire transaction,
`TransactionSignError` shall be thrown with the `ProofGeneration` code.

After the transaction is signed, a site may submit the transaction via
`api.submitTx` method.

#### Example

```typescript
const cborEncodedTransaction =
  '84a40081825820de6338bda690c615cf5d354bda0b1cbf15....672788ca2006e502f5f6'

try {
  const cborEncodedTransactionWitness = await api.signTx(cborEncodedTransaction)
  // 690c615cf5d354bda0b1cbf15e2a637addf7ee2de4eda95ec16a65ae42a20227a5a6c019f1843
} catch (error) {
  // { code: 1, message: 'User has accepted the transaction sign, but the wallet was unable to sign the transaction (e.g. not having some of the private keys).' }
}
```

### `api.submitTx(signedTransaction)`

```typescript
type Transaction = string // CBOR encoded.

api.submitTx(signedTransaction: Transaction): Promise<string>
```

This method submits a signed transaction to the Cardano network. This returns
the transaction hash if successful.

## Properties

### `cardano.exodus.icon`

Exodus icon (URI image).

### `cardano.exodus.name`

Returns `Exodus` as the name of the provider.

### `cardano.exodus.apiVersion`

The current version of the provider.
