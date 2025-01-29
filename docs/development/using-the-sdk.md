# Using the SDK

## Just show me the code, Schneebly

- The [sdk-minimal-demo](https://github.com/ExodusOSS/hydra/tree/master/apps/sdk-minimal-demo/) has examples of the minimal setup required to use the SDK.
- The [sdk-playground](https://github.com/ExodusOSS/hydra/tree/master/apps/sdk-playground/) is a simple single-process web app where you can play with the SDK right in your browser.

And [actually, it's Schnay-blay](https://www.youtube.com/watch?v=MKUH-TZcSqE).

## Single vs Multi-process

`@exodus/headless`, a.k.a. "The SDK", is designed to work in both types of environments. There are two main logical pieces: the API side and the UI side. In single-process apps, e.g. a vanilla React Native app, both will live together in one process. In multi-process environments, e.g. a browser extension, a website with web-workers, an Electron app, Node.js, etc., you may choose to separate the two for performance or even just for architectural clarity. Of course, when you separate them, you'll need a transport and RPC layer.

[sdk-minimal-demo](https://github.com/ExodusOSS/hydra/tree/master/apps/sdk-minimal-demo/) has both single-process and multi-process examples. Zoom into some of the pieces below.

### Setup: the API side

We're [not there yet](https://github.com/ExodusOSS/hydra/issues/7750), but we want to get to very lightweight initialization code, e.g.:

```js
import createExodus from '@exodus/headless'
import adapters from '@exodus/adapters-web' // doesn't exist yet

const exodus = createExodus({ adapters })
```

In the meantime, you'll have to do a bit more wiring:

#### Choose your platform

The SDK is designed to be platform-agnostic and thus must accept a number of platform-specific adapters for storage, network, build metadata, a port for connecting to the UI side, etc. The runtime environment dependent ones will soon be prepackaged as `@exodus/adapters-web`, `@exodus/adapters-mobile`, etc. for convenience, but the app-specific ones you'll always have to inject yourself, e.g. the asset plugins (`@exodus/bitcoin-plugin`, `@exodus/ethereum-plugin`, etc).

See the [sdk-playground](https://github.com/ExodusOSS/hydra/tree/master/apps/sdk-playground/src/background/adapters/index.ts) for (roughly) what will soon be packaged as `@exodus/adapters-web`

#### Choose your features

`@exodus/headless` ships with core features built in. You can plug in additional features similarly to how you'd add middleware to `express`:

```js
import createExodus from '@exodus/headless'

const sdkBuilder = createExodus({ adapters, config })
sdkBuilder.use(myFeature())
// locks down the feature set and resolves the dependency graph. You can't call `use()` after this
const exodus = sdkBuilder.resolve()
```

Further reading: see the [core features](https://github.com/ExodusOSS/hydra/tree/master/sdks/headless/src/index.js) bundled into headless, and the [features available for you to plug into it](https://github.com/ExodusOSS/hydra/tree/master/features/).

#### Configure your features

Many features in the SDK are configurable. Most will soon ship with sensible defaults, towards a [zero-conf-by-default experience](https://github.com/ExodusOSS/hydra/issues/5820).

In the meantime, you'll need to supply a `config` object to headless:

```js
import createExodus from '@exodus/headless'

const config = {
  // ...
  [featureId]: featureConfig,
}

const exodus = createExodus({ adapters, config }).resolve()
```

### Connect the UI

The `exodus` instance of `@exodus/headless` you constructed on the the API does two things: provides an API to feature-specific functionality and emits events for state changes.

In single-process apps, you will use that instance directly from the UI. In multi-process apps, you'll need a [transport layer](https://github.com/ExodusOSS/hydra/blob/8ac3c1382e3d51923de4d73c43c32f92005ae351/apps/sdk-minimal-demo/src/__tests__/multi-process.ts#L94).

#### API

These are all the APIs provided by ['api'](legos.md#api-slices) nodes in the SDK. See a usage example below and many others in [https://github.com/ExodusOSS/hydra/tree/master/sdks/headless/](https://github.com/ExodusOSS/hydra/tree/master/sdks/headless/__tests__/):

```js
await exodus.application.start()
await exodus.application.create({ passphrase })
await exodus.wallet.exists() // true
await exodus.addressProvider.getAddress({
  purpose: 44,
  assetName: 'bitcoin',
  walletAccount: WalletAccount.DEFAULT_NAME,
  chainIndex: 0,
  addressIndex: 0,
})
```

See the full APIs for the above features:

- [application](https://github.com/ExodusOSS/hydra/tree/master/features/application/src/api/index.ts)
- [wallet](https://github.com/ExodusOSS/hydra/tree/master/features/wallet/api/index.js)
- [addressProvider](https://github.com/ExodusOSS/hydra/tree/master/features/address-provider/api/index.js)

#### Events

The SDK emits events you can subscribe to. These come from various domain-specific plugins, e.g. [walletAccounts](https://github.com/ExodusOSS/hydra/blob/8ac3c1382e3d51923de4d73c43c32f92005ae351/features/wallet-accounts/plugins/lifecycle.js#L15-L34), [apyRates](https://github.com/ExodusOSS/hydra/tree/master/features/apy-rates/plugin/index.js#L4), etc.

```js
exodus.subscribe(console.log) // e.g. { type: 'activeWalletAccount', payload: 'exodus_0' }
```

On the UI side, Exodus provides helpers to copy events into redux state, namespaced per feature. In addition, most features ship with a number of selectors. With `@exodus/headless/redux` the setup is reduced to a few lines of code.

Once you have that `selectors` export, you can connect it to any component:

```js
import { selectors } from '~/ui/flux'

const MyComponent = () => {
  // selector definition https://github.com/ExodusOSS/hydra/tree/master/features/fiat-balances/redux/selectors/by-wallet-account.js
  const balances = useSelector(selectors.fiatBalances.byWalletAccount)
  // ...
}
```
