# @exodus/wallet

Exodus SDK feature that manages [bip39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) mnemonic phrase(s) for a single-seed or multi-seed wallet.

> [!IMPORTANT]
> This feature uses the injected `seedStorage` implementation to store mnemonic phrases. It passes the `passphrase` provided to `wallet.create|import|changePassphrase` down to `seedStorage.set`, e.g. `seedStorage.set(value, { passphrase })`. Depending on the security of the platform where you're running the wallet, and the media that `seedStorage` uses on that platform, you may want to use a `seedStorage` implementation that supports encryption, e.g. [storage-seco](../../adapters/storage-seco).

## Install

```sh
yarn add @exodus/wallet
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

### Play with it

1. Open the playground https://exodus-hydra.pages.dev/features/wallet
2. Try out some methods via the UI. These correspond 1:1 with the `exodus.wallet` API.
3. Run the following in the Dev Tools Console:

```js
await exodus.wallet.isLocked() // false. The playground auto-unlocks for ease of use
await exodus.wallet.lock()
await exodus.wallet.isLocked() // true
await exodus.wallet.unlock({ passphrase: 'abracadabra' }) // passphrase used in playground
```

### API Side

See [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK and the API interface in the [type declaration](./api/index.d.ts).

Usage example:

```ts
// kick of various processes that might not require a mnemonic to be present
await exodus.application.start()
await exodus.application.load()
// create a new wallet
await exodus.wallet.create({ passphrase })
// alternatively, import a 12 word mnemonic phrase
// await exodus.wallet.import({ mnemonic, passphrase })

await exodus.wallet.exists() // now true

// by default a wallet is locked until explicitly unlocked
await exodus.wallet.isLocked() // true
await exodus.wallet.unlock({ passphrase })
await exodus.wallet.isLocked() // false

await exodus.wallet.lock()
// change the passphrase. Reminder: encryption is the responsibility of `seedStorage`!
await exodus.wallet.changePassphrase({ currentPassphrase, newPassphrase })
```

### UI Side

This feature doesn't export any redux state or selectors.
