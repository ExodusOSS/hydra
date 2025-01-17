# Architectural Legos

Exodus' multi-platform wallet apps have produced several useful conceptual legos to help people organize and structure their code, plug it into the greater application, and help solve the hard problem of dependency management. These legos are libraries, modules, atoms, plugins, API slices and features. What they have in common is their unwavering...you could say fanatical...devotion to explicit dependency management and platform/environment/framework agnosticism. See the video intros below, and/or read on.

- [Exploring the Exodus SDK Architecture](https://www.loom.com/share/110f87ac4b9a4134abbd3cddbae0d394)

- [Modules/Plugins/Atoms](https://www.loom.com/share/3ae9e6cc49bc4c058f1fb0650c9a6f5a). The video Diego mentions here is "[Exodus Browser Extension Architecture](https://www.loom.com/share/d57b895e3c634355ad10b0f46ce613a7?sid=f4a8c72e-c1be-4c36-9965-e712a521515d)."
- [Live-coding a feature](https://www.loom.com/share/e9f050bec8324f5197da4d2bdcfeb4e8)

> [!NOTE]
> This doc introduces different definitions for the words libraries, modules, atoms and plugins than you may be used to.

## Libraries

Libraries are stateless utils like lodash, eslint plugins and currency wrappers.

## Modules

Modules manage a piece of a business domain and encapsulate the relevant logic/state.

Modules can export an API for managing their domain e.g. `walletAccounts.create(newWalletAccount)` , `keychain.signTx(tx)` , etc., but this is not a hard requirement; some modules only publish changes to their internal state via atoms.

Modules often depend on other modules and atoms.

### Examples

- [walletAccounts module](https://github.com/ExodusMovement/exodus-hydra/tree/master/features/wallet-accounts/module/wallet-accounts.js): manages portfolios, their creation, deletion, and various metadata about them like label, color, icon, etc.
- [balances module](https://github.com/ExodusMovement/exodus-hydra/tree/master/features/balances/module/index.js): tracks balances within and across portfolios.
- [keychain module](https://github.com/ExodusMovement/exodus-oss/blob/df135bc126b0bad9b9a64cc156afffebf4a0f5d3/features/keychain/module/keychain.js): lets you perform various cryptographic operations with the wallet's seed.

## Atoms

Dependencies make upstream code difficult and dangerous to change. If a module has 10 consumers, it's basically immutable. Any changes to it can cause an avalanche of side-effects downstream. This is one reason you should aim for as few dependencies as possible. This is also why you should [Default to Private Instance Methods and Variables](recipes-and-anti-patterns.md#default-to-private-instance-methods-and-variables), and make public only the tiny slice you want consumed and are prepared to maintain.

Initially modules depended on other modules, e.g. the `balances` module depended on the `walletAccounts` module to determine the walletAccounts to calculate balances for. As we extracted [more and more domains](https://github.com/ExodusMovement/exodus-hydra/tree/7ffeb66d51a0d34bcd13c89851ae52b8e91dce2a/features) into modules, our dependency graph grew rapidly in complexity. We were scared and wanted our mommies 🍼.

Our mommies noticed that what most modules really wanted from other modules was read-only access to their state and not necessarily their entire API. Going back to our example, the balances module doesn't need the ability to create, enable, remove, or do anything else with `walletAccounts`. That's too much! It only needs to know the set of `walletAccounts` that exist, and subscribe to changes in that set.

Atoms make a piece of state observable and abstract away the source of that state, e.g. in-memory/storage/fusion/network for consumers. They provide a unified interface to reading/writing/subscribing to that piece of state, e.g. `walletAccountsAtom.get()` / `walletAccountsAtom.set(walletAccounts)` / `walletAccountsAtom.observe(callback)` .

Atoms simplify the dependencies of consumers and make integration tests easier to write.

### Examples

- [language](https://github.com/ExodusMovement/exodus-hydra/tree/master/features/locale/atoms/language.js)
- [availableAssetNames](https://github.com/ExodusMovement/exodus-hydra/tree/master/features/available-assets/atoms/available-asset-names.js)
- [walletAccounts](https://github.com/ExodusMovement/exodus-hydra/tree/master/features/wallet-accounts/atoms/wallet-accounts.js)

## Plugins

Every application has a lifecycle. For example, the [Exodus wallet application lifecycle](https://github.com/ExodusMovement/exodus-hydra/tree/master/features/application/README.md#visual-representation) includes `lock`, `unlock`, `start`, `backup`, `restore` and other state transitions. A transition to each state can have a variety of side-effects which need to live somewhere. Initially they lived in modules and glue code, neither of which was good. Modules shouldn't know about things like application lifecycle, their poor domain-specific brains would melt. And the glue code was getting out of hand. Our hands were glued to our faces. We tripped a lot. When adding a new module or a new side-effect, we'd have to add a line of code to 15 different places where application lifecycle hooks were handled. We were getting scared again...

Enter plugins.

A plugin encapsulates a single side-effect. Today, most of these are tied to the application lifecycle and export lifecycle hooks declaratively, e.g. `onLoad`, `onUnlock`, `onRestore` (see supported lifecycle hooks). Most features have a plugin that:

- Hydrates/gracefully shuts down the relevant module in the `onStart` / `onStop` hooks, e.g. calls `connectedOrigins.load()` / `connectedOrigins.stop()`
- Starts/stops observing one or more feature-specific atoms in the `onStart` / `onStop` hooks and propagates its value to the UI (e.g. the locale feature plugin does this for `currencyAtom` and `languageAtom`)
- Clears feature-specific storage on onClear, when the user deletes their wallet or imports a different 12 word phrase.

Plugins are designed to be self-contained, so that if at some point you no longer need a given side-effect, you can simply delete that plugin file. Or if you don't need a given plugin on a certain platform, just don't include it. Just say no!

Examples

- [Sync earliest transaction date to fusion](https://github.com/ExodusMovement/exodus-hydra/tree/master/features/blockchain-metadata/plugin/sync-earliest-tx-plugin.js) when all assets have finished syncing.
- [Set various fields for analytics on app start.](https://github.com/ExodusMovement/exodus-hydra/tree/master/features/ab-testing/plugins/analytics.js)
- [Refresh the relevant monitors](https://github.com/ExodusMovement/exodus-hydra/tree/master/features/tx-log-monitors/plugin/index.js) when assets are enabled.

## API slices

When modules, atoms and plugins are assembled into the Exodus SDK using [@exodus/headless](https://github.com/ExodusMovement/exodus-hydra/tree/master/sdks/headless), the question arises: what should the SDK's API look like to the consumer? Like any other well-designed API surface, it should expose semantics rather than architectural concepts and be as small as possible but no smaller. We can't just re-export every single module, atom and plugin method. The consumer of the Exodus SDK shouldn't need to know about modules, atoms and plugins at all.

This is where API slices come in. Like anything else in the dependency tree, API slice node definitions have a unique string `id`, a `type` (`'api'`), an array of ids in `dependencies`, and a `factory` function. The factory function returns namespaced methods that should be exported to the SDK surface. For example, the abTestingApi exports an SDK namespace `abTesting` with two methods: `trackEvent` and `updateVariant`:

```js
const abTestingApi = ({ abTesting }) => ({
  abTesting: {
    trackEvent: abTesting.trackEvent,
    updateVariant: abTesting.updateVariant,
  },
})

export default {
  id: 'abTestingApi',
  type: 'api',
  factory: abTestingApi,
  dependencies: ['abTesting'],
}
```

When the SDK is assembled at runtime, this allows the consumer to do:

```js
exodus.use(abTesting())
// ... after exodus.resolve()
exodus.abTesting.trackEvent(opts)
exodus.abTesting.updateVariant(opts)
```

## Features

A feature is a grouping of module(s), atom(s), plugin(s) and API slice(s) that together implement a...feature (e.g. nfts, personal-notes, balances, etc) and its behavior with respect to the application lifecycle.

A feature is designed to be plugged into the Exodus SDK, similarly to how Express.js middleware plugs into Express.js:

```js
exodus.use(someFeature(config))
```

This allows the core SDK to remain light, and for the consumer to specify the features they want included.

To enable this, we have declarative feature definitions. These accept any runtime configuration the feature requires and return a feature id and a set of definitions related to that feature. The feature definition can then pass down any configuration to constituent modules/atoms/plugins. This is the preferred way to pass configuration.

For example, the `voldemort` feature below accepts some runtime configuration options specifying whether he should have a sense of humor, and his eye color. It returns all the modules, atoms, plugins and API slices that are part of its domain:

```js
const voldemort = ({ enableSenseOfHumor, eyeColor }) => ({
  id: 'voldemort',
  definitions: [
    {
      definition: voldemortModuleDefinition,
      config: { enableSenseOfHumor, eyeColor },
    },
    { definition: voldemortAtomDefinition },
    { definition: voldemortPluginDefinition },
    { definition: voldemortAccessoriesAtomDefinition },
    {
      if: enableSenseOfHumor,
      definition: voldemortJokesAtomDefinition,
    },
  ],
})

export default voldemort
```

### Consuming Features

There are multiple ways to consume features, or sub-components of features:

1. From inside the SDK: feature A's node depends on feature B's node, via the IOC container. Example: the [blockchainMetadata](https://github.com/ExodusMovement/exodus-hydra/tree/master/features/blockchain-metadata/module/blockchain-metadata.js) node from the [@exodus/blockchain-metadata](https://github.com/ExodusMovement/exodus-hydra/tree/master/features/blockchain-metadata/) feature depends on the [assetsModule](https://github.com/ExodusMovement/exodus-hydra/tree/master/features/assets-feature/module/assets-module.js) node from the [@exodus/assets-feature](https://github.com/ExodusMovement/exodus-hydra/tree/master/features/assets-feature/) feature.
2. From outside the SDK: if your feature exports an API node, it gets exported to a namespace on the SDK, e.g. the [@exodus/locale](https://github.com/ExodusMovement/exodus-hydra/tree/master/features/locale) feature exposes a setLanguage method on the locale namespace, which can be used as `exodus.locale.setLanguage('en')`
3. On the UI side, [via selectors](https://github.com/ExodusMovement/exodus-hydra/tree/master/features/wallet-accounts/redux/selectors/active.js), e.g. `useSelector(selectors.walletAccounts.active)`

## Philosophy

One commonality you may have noticed is that **modules and API slices** have _different/unique_ API surfaces, because they encapsulate and provide APIs to different domains, e.g. personal notes, exchange, balances. By contrast, **plugins** and **atoms** export _uniform_ APIs (ahem, plugins, get your act together!). Atoms do this in order to allow storage-media-agnostic and domain-agnostic data-consumption. Plugins do this in order to centralize everything around a given side-effect in a single place, and match their shape to the extension point (hooks, events) of a host (application, module, potentially even an atom).
