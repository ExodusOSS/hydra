---
sidebar_position: 2
---

# Algorand Provider API (Deprecated)

:::caution

The provider injected at `window.exodus.algorand` has been deprecated in favor
of `window.algorand`.

:::

Exodus injects a global API into websites visited by its users at
`window.exodus.algorand`.

## Properties

### `algorand.isConnected`

`true` if the provider is exposing the user's account, and `false` otherwise.

### `algorand.address`

The address of the user's account if the provider is connected, and `null`
otherwise.

## Methods

### `algorand.connect()`

```typescript
interface ConnectionOptions {
  onlyIfTrusted?: boolean
}

interface ConnectInfo {
  address: string
}

algorand.connect(options?: ConnectionOptions): Promise<ConnectInfo>
```

Use `connect()` to request access to the user's account. This will open a pop-up
asking the user to approve the connection. Upon approval, Exodus will expose the
address of the user's account via [`algorand.address`](#algorandaddress) and
emit a [`connect`](#connect) event.

#### Example

```typescript
try {
  const resp = await window.exodus.algorand.connect()
  resp.address
  // C7RYOGEWDT7HZM3HKPSMU7QGWTRWR3EPOQTJ2OHXGYLARD3X62DNWELS34
  window.exodus.algorand.address
  // C7RYOGEWDT7HZM3HKPSMU7QGWTRWR3EPOQTJ2OHXGYLARD3X62DNWELS34
} catch (err) {
  // { code: 4001, message: 'User rejected the request.' }
}
```

#### Eagerly Connecting

After the user approves a Web3 site's connection to Exodus, the site becomes
trusted. This allows the site to automatically connect to Exodus on subsequent
visits or page refreshes. This is referred to as "eagerly connecting".

If you want to try to eagerly connect, you can pass the `onlyIfTrusted` option
to `connect()`.

```typescript
try {
  await window.exodus.algorand.connect({ onlyIfTrusted: true })
} catch (err) {
  // { code: 4001, message: 'User rejected the request.' }
}
```

:::tip

When using this flag, Exodus will only connect if the site is trusted and won't
bother your users with a pop-up if they have not connected to Exodus before.

:::

### `algorand.disconnect()`

```typescript
algorand.disconnect(): void
```

Use `disconnect()` to remove access to the user's account. Upon disconnection,
Exodus will emit a [`disconnect`](#disconnect) event.

#### Example

```typescript
window.exodus.algorand.disconnect()
window.exodus.algorand.address
// null
```

:::note

It is also possible for Exodus to initiate the disconnection, rather than the
site itself. For this reason, it's important for sites to gracefully handle the
[`disconnect`](#disconnect) event.

:::

### `algorand.signAndSendTransaction()`

```typescript
interface TransactionResult {
  txId: string
}

algorand.signAndSendTransaction(transactions: Uint8Array[]): Promise<TransactionResult>
```

Use `signAndSendTransaction()` to request the Exodus user to sign a single
transaction or multiple grouped transactions. If approved, Exodus will sign the
transactions using the user's private key and submit them to the Algorand
network. It returns a `Promise` that resolves to the transaction result. The
result will contain the transaction ID of the submitted transaction in the case
of a single transaction, or the transaction ID of the first transaction
otherwise.

#### Example

```typescript
const algodClient = new algosdk.Algodv2(/* ... */)
const suggestedParams = await algodClient.getTransactionParams().do()
const transaction1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  suggestedParams,
  from: window.exodus.algorand.address,
  to: 'VCMJKWOY5P5P7SKMZFFOCEROPJCZOTIJMNIYNUCKH7LRO45JMJP6UYBIJA',
  amount: 1000000, // Equals 1 ALGO
})
const transaction2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  suggestedParams,
  from: window.exodus.algorand.address,
  to: 'VCMJKWOY5P5P7SKMZFFOCEROPJCZOTIJMNIYNUCKH7LRO45JMJP6UYBIJA',
  amount: 2000000, // Equals 2 ALGO
})

const { txId } = await window.exodus.algorand.signAndSendTransaction([
  transaction1.toByte(),
  transaction2.toByte(),
])
```

### `algorand.signTransaction()`

```typescript
algorand.signTransaction(transactions: Uint8Array[]): Promise<Uint8Array[]>
```

Use `signTransaction()` to request the Exodus user to sign a single transaction
or multiple grouped transactions. If approved, Exodus will sign the transactions
using the user's private key _without_ submitting it to the Algorand network. It
returns a `Promise` that resolves to the raw signed transactions.

After the transactions have been signed, a site may submit them via `algosdk`'s
[`sendRawTransaction`](https://developer.algorand.org/docs/sdks/javascript/#submit-the-transaction).

#### Example

```typescript
const algodClient = new algosdk.Algodv2(/* ... */)
const suggestedParams = await algodClient.getTransactionParams().do()
const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  suggestedParams,
  from: window.exodus.algorand.address,
  to: 'VCMJKWOY5P5P7SKMZFFOCEROPJCZOTIJMNIYNUCKH7LRO45JMJP6UYBIJA',
  amount: 1000000, // Equals 1 ALGO
})

const signedTransactions = await window.exodus.algorand.signTransaction([transaction.toByte()])
```

### `algorand.signMessage()`

```typescript
type DisplayEncoding = 'utf8' | 'hex'

algorand.signMessage(encodedMessage: Uint8Array, display?: DisplayEncoding = 'utf8'): Promise<{ signature: Uint8Array, address: string }>
```

Use `signMessage()` to request the Exodus user to sign an arbitrary message. The
message must be a hex or UTF-8 encoded string provided as a `Uint8Array`, and
will be prefixed with "MX". It returns a `Promise` that resolves to the
signature of the message, and the address that can be used to verify the
signature.

#### Example

```typescript
const message = 'Please sign below'
const encodedMessage = new TextEncoder().encode(message)
const { signature } = await window.exodus.algorand.signMessage(encodedMessage, 'utf8')
```

## Events

### `connect`

```typescript
interface ConnectInfo {
  address: string
}

algorand.on('connect', handler: (connectInfo: ConnectInfo) => void)
```

The Exodus provider emits this event when it starts exposing the address of the
user's account via [`algorand.address`](#algorandaddress).

### `disconnect`

```typescript
algorand.on('disconnect', handler: () => void)
```

The Exodus provider emits this event when it stops exposing the address of the
user's account via [`algorand.address`](#algorandaddress).

Once `disconnect` has been emitted, the provider will not accept any new
requests until the connection has been re-established.

### `accountChanged`

```typescript
algorand.on('accountChanged', handler: (address: string) => void)
```

The Exodus provider emits this event whenever the address exposed via
[`algorand.address`](#algorandaddress) changes. The address, if any, belongs to
the active account in Exodus.

This means that `accountChanged` will be emitted whenever the user's exposed
account changes.

## Transaction Constraints

Some constrains have been placed on the transaction signing request to prevent
any malicious activity from a web3 site interacting with our extension.

### Transaction Types

The following six transaction types are supported (albeit with certain
constraints):

- [Payment (type `pay`)](https://developer.algorand.org/docs/get-details/transactions/#payment-transaction)
- [Asset Configuration (type `acfg`)](https://developer.algorand.org/docs/get-details/transactions/#asset-configuration-transaction)
- [Asset Freeze (type `afrz`)](https://developer.algorand.org/docs/get-details/transactions/#asset-freeze-transaction)
- [Asset Transfer (type `axfer`)](https://developer.algorand.org/docs/get-details/transactions/#asset-transfer-transaction)
- [Application (type `appl`)](https://developer.algorand.org/docs/get-details/transactions/#application-call-transaction)
- [Key Registration (type `keyreg`)](https://developer.algorand.org/docs/get-details/transactions/#key-registration-transaction)

### Rekeying

[Rekeying](https://developer.algorand.org/docs/get-details/accounts/rekey) is a
powerful protocol feature that enables an Algorand account holder to maintain a
static public address while dynamically rotating the authoritative private
spending key(s). This is accomplished by issuing a "rekey-to transaction", which
sets the authorized address field within the account object.

:::caution

Exodus will reject signing any transaction that contains the `rekey` field. This
is to prevent a malicious web3 site from taking over the account.

:::

### Close Remainder

[Closing an account](https://developer.algorand.org/docs/get-details/transactions/#close-an-account)
means removing it from the Algorand ledger. Since there is a minimum balance
requirement for every account on Algorand, the only way to completely remove it
is to use the `Close Remainder To` field.

[Closing an asset](https://developer.algorand.org/docs/get-details/transactions/transactions/#asset-transfer-transaction)
means removing the asset balance from a given account on Algorand.
