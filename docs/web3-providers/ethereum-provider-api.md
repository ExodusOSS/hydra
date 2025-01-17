---
sidebar_position: 5
---

# Ethereum Provider API

Exodus injects a global API into websites visited by its users at
`window.exodus.ethereum`. This object is known as "the Provider" and its API is
specified by [EIP-1193](http://eips.ethereum.org/EIPS/eip-1193).

:::note

Exodus will also inject this API at `window.ethereum` for compatibility with
some existing Web3 sites. However, we recommend new integrations use
`window.exodus.ethereum` to avoid issues with namespace collisions.

:::

## Chain IDs

Exodus supports the following EVM chains out-of-the-box:

| Hex        | Decimal    | Network                  |
| ---------- | ---------- | ------------------------ |
| 0x1        | 1          | Ethereum Mainnet         |
| 0xa        | 10         | Optimism Mainnet         |
| 0xe        | 14         | Flare Mainnet            |
| 0x1e       | 30         | Rootstock Mainnet        |
| 0x38       | 56         | Binance Mainnet          |
| 0x3d       | 61         | Ethereum Classic Mainnet |
| 0x89       | 137        | Polygon Mainnet          |
| 0xfa       | 250        | Fantom Mainnet           |
| 0x2105     | 8453       | Base Mainnet             |
| 0xa4b1     | 42161      | Arbitrum One             |
| 0xa4ba     | 42170      | Arbitrum Nova            |
| 0xa86a     | 43114      | Avalanche C              |
| 0x4e454152 | 1313161554 | Aurora Mainnet           |

Adding chains dynamically is not yet supported. However, the list of supported
chains is growing fast. Stay tuned!

## Properties

### `ethereum.isExodus`

`true` if Exodus is the one injecting the `ethereum` object, and `false`
otherwise.

This may be useful if you are accessing `window.ethereum` and want to check if
Exodus is the one controlling that namespace.

:::caution

Non-Exodus providers may also set this property to `true`.

:::

## Methods

### `ethereum.isConnected()`

```typescript
ethereum.isConnected(): boolean
```

Returns `true` if the provider is connected (i.e. can make RPC requests) to the
current chain, and `false` otherwise. This method has nothing to do with the
user's accounts.

If the provider is not connected, the page will have to be reloaded in order for
the connection to be re-established. Please see the [`connect`](#connect) and
[`disconnect`](#disconnect) events for more information.

### `ethereum.request(args)`

```typescript
interface RequestArguments {
  method: string
  params?: unknown[] | object
}

ethereum.request(args: RequestArguments): Promise<unknown>
```

Use `request()` to submit RPC requests to Ethereum via Exodus. It returns a
`Promise` that resolves to the result of the RPC method call. If the request
fails for any reason, the `Promise` will reject with an
[Ethereum RPC Error](https://eips.ethereum.org/EIPS/eip-1193#rpc-errors).

Exodus supports most standardized Ethereum RPC methods, in addition to a number
of methods that may not be supported by other wallets. See the
[Ethereum RPC API documentation](ethereum-rpc-api.md) for details.

The `params` and return value will vary by RPC method.

#### Example

```typescript
const transaction = {
  from: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
  to: '0xd46e8dd67c5d32be8058bb8eb970870f07244567',
  gas: '0x76c0', // 30400
  gasPrice: '0x9184e72a000', // 10000000000000
  value: '0x9184e72a', // 2441406250
  data: '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
}

try {
  const resp = await window.exodus.ethereum.request({
    method: 'eth_sendTransaction',
    params: [transaction],
  })
  // For 'eth_sendTransaction', `resp` will be a transaction hash hexadecimal string.
} catch (err) {
  // If the request fails, the Promise will reject with an error.
}
```

## Events

### `connect`

```typescript
interface ConnectInfo {
  chainId: string
}

ethereum.on('connect', handler: (connectInfo: ConnectInfo) => void)
```

The Exodus provider emits this event when it first becomes able to submit RPC
requests to a chain.

:::tip

Use a `connect` event handler and the
[`ethereum.isConnected()`](#ethereumisconnected) method to determine when/if the
provider is connected.

:::

### `disconnect`

```typescript
ethereum.on('disconnect', handler: (error: ProviderRpcError) => void)
```

The Exodus provider emits this event if it becomes unable to submit RPC requests
to the current chain. In general, this will only happen due to network
connectivity issues or some unforeseen error.

Once `disconnect` has been emitted, the provider will not accept any new
requests until the connection to the chain has been re-restablished, which
requires reloading the page.

:::tip

Use a `disconnect` event handler and the
[`ethereum.isConnected()`](#ethereumisconnected) method to find out if the
provider is disconnected, and offer to reload the page if that is the case.

:::

### `accountsChanged`

```typescript
ethereum.on('accountsChanged', handler: (accounts: string[]) => void)
```

The Exodus provider emits this event whenever the return value of the
`eth_accounts` RPC method changes. `eth_accounts` returns an array that is
either empty or contains a single account address. The returned address, if any,
is the address of the active account in Exodus.

This means that `accountsChanged` will be emitted whenever the user switches
accounts in Exodus.
