# @exodus/dependency-injection

This is a basic inversion of control container that resolves a dependency graph and instantiates all nodes. You want to use this if you're stitching together an application from dozens of different modules and your imperatively defined dependency DAG is starting to become unmanagable.

There are lots of sophisticated inversion of control containers out there, e.g. [inversify](https://github.com/inversify/InversifyJS), [awilix](https://github.com/jeffijoe/awilix), and others. They're probably great. Someday we may switch to them, but at this point they're overkill and they raise the cognitive load higher than absolutely necessary. This library implements a simple container in a highly opinionated way with very little flexibility. Here is a sample node in a list of dependencies:

```js
[
  ...,
  {
    id: 'harry',
    dependencies: ['scar', 'dobby'],
    factory: ({ scar, dobby }) => {
      // Harry uses his scar to defeat dobby, or however that book goes
    },
    type: 'wizard', // optional
  }
]
```

As you can see:

- Each node has a globally unique string `id`.
- It lists its `dependencies` as string ids.
- It declares a `factory` function which receives a single object as an argument, with named options mapping 1:1 to ids listed in dependencies
- It declares an optional `type` field. You can use this to query the container for nodes where `type` is a certain value.

The container, given a list of such nodes, will give you all the instances. That's all there is to it!

## Usage

Declare nodes and edges, and let the container wire everything together.

```js
import createContainer from '@exodus/dependency-injection'

const createLogger =
  (namespace) =>
  (...args) =>
    console(namespace, ...args)

const container = createContainer({ logger })

container.registerMultiple([
  {
    id: 'storage',
    factory: createStorage,
  },
  {
    id: 'assetsModule',
    // the container will pass `({ logger })` to the factory
    factory: createAssetsModule,
    dependencies: ['logger'],
  },
  {
    id: 'walletAccountsAtom',
    factory: () =>
      createInMemoryAtom({
        defaultValue: { [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT },
      }),
  },
  {
    id: 'enabledWalletAccountsAtom',
    // the container will pass `({ walletAccountsAtom })` to the factory
    factory: createEnabledWalletAccountsAtom,
    dependencies: ['walletAccountsAtom'],
  },
  {
    id: 'blockchainMetadata',
    factory: createBlockchainMetadata,
    // the container will pass `({ assetsModule, enabledWalletAccountsAtom })` to the factory
    dependencies: ['assetsModule', 'enabledWalletAccountsAtom'],
  },
])
```

### Overriding dependencies

The container will throw when it encounters a duplicate dependency id. To override a dependency for test purposes, use the override flag

```js
container.register({
  id: 'balances',
  override: true,
  factory: () => ({ load: jest.fn() }),
})

container.resolve()

const {
  storage,
  assetsModule,
  walletAccountsAtom,
  enabledWalletAccountsAtom,
  blockchainMetadata,
  balances,
} = container.getAll()
```

### Optional dependencies

Optional dependencies can be requested by appending a trailing `?`:

```js
container.register({
  id: 'jediSurvivor',
  factory: ({ lightsaber, theForce }) => {
    if (lightsaber) {
      // code has to make sure optionality is gracefully handled
      return new InsaneLightsaberWiedlingJedi(lightsaber)
    }

    return new ThereIsOnlyTheForce(theForce)
  },
  dependencies: ['lightsaber?', 'theForce'],
})
```

### Injection Style

By default dependencies are injected as named options, which is the recommended pattern. However, if your use case demands dependencies to be injected as positional arguments, e.g. if your factory function is a `reselect` selector, specify `injectDependenciesAsPositionalArguments: true` either at the container level via the constructor, or at the individual node level. See [examples](./__tests__/index.test.ts) in tests.

## Known Issues / Limitations

- Only one instance of every node is ever created. In 99% of cases this is what you want but see [Misc](#misc-overachievers-only) section for an example of getting around this.
- This implementation conflates several concepts to one `id`:
  - The globally unique package id, as exported by a given package, e.g. `'analytics'` for the [analytics](../../features/analytics) module.
  - The globally unique _interface_ identifier, e.g. `'analytics'`, which corresponds to an object with certain methods with certain signatures. This is declared by consumers of analytics in their `dependencies` array of ids.
  - The constructor option name, for consumers of analytics, e.g. `constructor({ analytics })`

In the future we might disambiguate these, but in the short term we've opted for simplicity.

## Example (headless)

See [headless](../../sdks/argo/src/index.js) as a real-world e2e example that initializes an IOC and makes use of
multiple preprocessors.

## Rationale

Allow me to simulate your internal dialogue.

`You`: Holy crap! The afterlife is 1) more verbose, 2) has higher cognitive load and 3) breaks Intellisense by using ids instead of function pointers.
`Container`: I hear you. I should improve those ([help me help you](https://www.youtube.com/shorts/T_3pFzfZFsw)). On the other hand, I have several advantages that grow as your list of nodes grows (e.g. the Exodus browser extension already has >100 nodes). I enable you to:

- Define your dependencies declaratively.
- Stop manually managing instantiation order. I'll sort things out by walking the dependency graph.
- Unify instantiation patterns and best practices.
- Validate that a node receives all declared dependencies and doesn’t receive any undeclared ones.
- Centralize logging, error handling, permissions, etc. This lets you DRY up your code.
- Track event/data propagation through the dependency tree.
- Visualize/print/map out your dependency graph.
- [Auto-inject](../dependency-preprocessors) namespaced loggers, namespaced storage instances, and node-specific configuration en masse.

## Misc (overachievers only)

Check out [@exodus/dependency-preprocessors](../dependency-preprocessors), which enables the `config` and `logger` special cases described above, and more.
