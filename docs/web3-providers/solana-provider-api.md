---
sidebar_position: 7
---

# Solana Provider API

Exodus injects a global API into websites visited by its users at
`window.exodus.solana`.

:::note

Exodus will also inject this API at `window.solana` for compatibility with some
existing Web3 sites. However, we recommend new integrations use
`window.exodus.solana` to avoid issues with namespace collisions.

:::

## Properties

### `solana.isExodus`

`true` if Exodus is the one injecting the `solana` object, and `false`
otherwise.

This may be useful if you are accessing `window.solana` and want to check if
Exodus is the one controlling that namespace.

:::caution

Non-Exodus providers may also set this property to `true`.

:::

### `solana.isConnected`

`true` if the provider is exposing the user's account, and `false` otherwise.

### `solana.publicKey`

The public key of the user's account if the provider is connected, and `null`
otherwise.

### `solana.supportedTransactionVersions`

A
[Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
containing the transaction versions supported by Exodus.

## Methods

### `solana.connect(options)`

```typescript
interface ConnectionOptions {
  onlyIfTrusted?: boolean
}

solana.connect(options?: ConnectionOptions): Promise<{ publicKey: PublicKey }>
```

Use `connect()` to request access to the user's account. This will open a pop-up
asking the user to approve the connection. Upon approval, Exodus will expose the
public key of the user's account via [`solana.publicKey`](#solanapublickey) and
emit a [`connect`](#connect) event.

#### Example

```typescript
try {
  const resp = await window.exodus.solana.connect()
  resp.publicKey.toString()
  // 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo
  window.exodus.solana.publicKey.toString()
  // 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo
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
  await window.exodus.solana.connect({ onlyIfTrusted: true })
} catch (err) {
  // { code: 4001, message: 'User rejected the request.' }
}
```

:::tip

When using this flag, Exodus will only connect if the site is trusted and won't
bother your users with a pop-up if they have not connected to Exodus before.

:::

### `solana.disconnect()`

```typescript
solana.disconnect(): void
```

Use `disconnect()` to remove access to the user's account. Upon disconnection,
Exodus will emit a [`disconnect`](#disconnect) event.

#### Example

```typescript
window.exodus.solana.disconnect()
window.exodus.solana.publicKey
// null
```

:::note

It is also possible for Exodus to initiate the disconnection, rather than the
site itself. For this reason, it's important for sites to gracefully handle the
[`disconnect`](#disconnect) event.

:::

### `solana.signAndSendTransaction(transaction, options)`

```typescript
type Commitment = 'processed' | 'confirmed' | 'finalized'

type LegacyOrVersionedTransaction = Transaction | VersionedTransaction

interface SendOptions {
  maxRetries?: number
  minContextSlot?: number
  skipPreflight?: boolean
  preflightCommitment?: Commitment
}

solana.signAndSendTransaction(transaction: LegacyOrVersionedTransaction, options?: SendOptions): Promise<{ signature: string }>
```

Use `signAndSendTransaction()` to request the Exodus user to sign a transaction.
If approved, Exodus will sign the transaction using the user's private key and
submit it to the Solana network. It returns a `Promise` that resolves to the
signature of the submitted transaction (in Base58 encoding).

After the transaction has been sent, a site may use the signature to verify if
the transaction was confirmed via
[`web3.js`'s `confirmTransaction`](https://solana-labs.github.io/solana-web3.js/classes/Connection.html#confirmTransaction).

#### Example

```typescript
const endpoint = '<JSON_RPC_ENDPOINT_URL>'
const connection = new Connection(endpoint)
const transaction = new VersionedTransaction(/* ... */)

const { signature } = await window.exodus.solana.signAndSendTransaction(transaction)

await connection.confirmTransaction(signature)
```

### `solana.signTransaction(transaction)`

```typescript
type LegacyOrVersionedTransaction = Transaction | VersionedTransaction

solana.signTransaction(transaction: LegacyOrVersionedTransaction): Promise<LegacyOrVersionedTransaction>
```

Use `signTransaction()` to request the Exodus user to sign a transaction. If
approved, Exodus will sign the transaction using the user's private key
_without_ submitting it to the Solana network. It returns a `Promise` that
resolves to the signed transaction.

After the transaction has been signed, a site may submit the transaction itself
via
[`web3.js`'s `sendRawTransaction`](https://solana-labs.github.io/solana-web3.js/classes/Connection.html#sendRawTransaction).

#### Example

```typescript
const endpoint = '<JSON_RPC_ENDPOINT_URL>'
const connection = new Connection(endpoint)
const transaction = new VersionedTransaction(/* ... */)

const signedTransaction = await window.exodus.solana.signTransaction(transaction)

const rawTransaction = signedTransaction.serialize()
const signature = await connection.sendRawTransaction(rawTransaction)
```

### `solana.signAllTransactions(transactions)`

```typescript
type LegacyOrVersionedTransaction = Transaction | VersionedTransaction

solana.signAllTransactions(transactions: LegacyOrVersionedTransaction[]): Promise<LegacyOrVersionedTransaction[]>
```

Use `signAllTransactions()` to request the Exodus user to sign multiple
transactions at once. If approved, Exodus will sign _all_ the transactions using
the user's private key _without_ submitting them to the Solana network. It
returns a `Promise` that resolves to the signed transactions.

#### Example

```typescript
const signedTransactions = await window.exodus.solana.signAllTransactions(transactions)
```

### `solana.signMessage(encodedMessage, display)`

```typescript
type DisplayEncoding = 'utf8' | 'hex'

solana.signMessage(encodedMessage: Uint8Array, display?: DisplayEncoding = 'utf8'): Promise<{ signature: Uint8Array; publicKey: PublicKey }>
```

Use `signMessage()` to request the Exodus user to sign an arbitrary message. The
message must be a hex or UTF-8 encoded string provided as a `Uint8Array`. It
returns a `Promise` that resolves to the signature of the message, and the
public key that can be used to verify the signature.

#### Example

```typescript
const message = 'Please sign below'
const encodedMessage = new TextEncoder().encode(message)
const { signature } = await window.exodus.solana.signMessage(encodedMessage, 'utf8')
```

## Events

### `connect`

```typescript
interface ConnectInfo {
  publicKey: PublicKey
}

solana.on('connect', handler: (connectInfo: ConnectInfo) => void)
```

The Exodus provider emits this event when it starts exposing the public key of
the user's account via [`solana.publicKey`](#solanapublickey).

### `disconnect`

```typescript
solana.on('disconnect', handler: () => void)
```

The Exodus provider emits this event when it stops exposing the public key of
the user's account via [`solana.publicKey`](#solanapublickey).

Once `disconnect` has been emitted, the provider will not accept any new
requests until the connection has been re-restablished.

### `accountChanged`

```typescript
solana.on('accountChanged', handler: (publicKey: PublicKey) => void)
```

The Exodus provider emits this event whenever the public key exposed via
[`solana.publicKey`](#solanapublickey) changes. The public key, if any, belongs
to the active account in Exodus.

This means that `accountChanged` will be emitted whenever the user's exposed
account changes.
