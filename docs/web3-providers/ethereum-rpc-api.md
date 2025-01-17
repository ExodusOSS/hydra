---
sidebar_position: 6
---

# Ethereum RPC API

Wrap any RPC API call with the
[`ethereum.request()` method](ethereum-provider-api.md#ethereumrequestargs).

The RPC API builds on top of the
[API exposed by all Ethereum clients](#ethereum-json-rpc-api-methods), adding
some [additional methods](#additional-api-methods).

## Ethereum JSON-RPC API Methods

See the full Ethereum JSON-RPC API spec in the
[Ethereum wiki](https://ethereum.org/en/developers/docs/apis/json-rpc/#json-rpc-methods).

Pay particular attention to these methods:

- [eth_accounts](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_accounts)
- [eth_call](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call)
- [eth_getBalance](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getbalance)
- [eth_sendTransaction](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
- [eth_sign](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sign)

## Additional API Methods

### `wallet_addEthereumChain`

:::tip Standard

This method is specified by [EIP-3085](https://eips.ethereum.org/EIPS/eip-3085).

:::

Exodus does not yet support adding chains dynamically.

If the chain is already supported by Exodus, the request will succeed.

In any other case, Exodus will reject this request.

### `wallet_switchEthereumChain`

:::tip Standard

This method is specified by [EIP-3326](https://eips.ethereum.org/EIPS/eip-3326).

:::

Switches to the chain with the specified chain ID.

Unlike other wallets like MetaMask, Exodus is stateless. This means that there
is no concept of "active chain" at the wallet level. When a web3 site requests
switching the chain, the change only affects that site. Switching to a different
chain does not prompt the user for confirmation. Instead, the "active chain"
(from the web3 site's point of view) is displayed when asking for approval when
signing transactions or messages.

Exodus will reject the request under the following circumstances:

- If the chain ID is malformed.
- If the chain with the specified chain ID is not supported by Exodus.

See the list of
[chains supported by Exodus](ethereum-provider-api.md#chain-ids).

#### Parameters

- `Array`

  0. `SwitchEthereumChainParameter` - Metadata about the chain that Exodus will
     switch to.

```typescript
interface SwitchEthereumChainParameter {
  chainId: string // A 0x-prefixed hexadecimal string.
}
```

#### Returns

`null` - The method returns `null` if the request was successful, and an error
otherwise.

If the error code (`error.code`) is `4902`, then the requested chain is not
supported by Exodus.

#### Example

```typescript
try {
  await window.exodus.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x89' }],
  })
} catch (switchError) {
  // This error code indicates that the chain is not supported by Exodus.
  if (switchError.code === 4902) {
    // Handle chain not supported.
  }
  // Handle other "switch" errors.
}
```
