# Dependency Injection

The Exodus SDK uses the [dependency-injection](https://github.com/ExodusOSS/hydra/tree/master/libraries/dependency-injection) Inversion of Control Container (IoC) to instantiate and wire up all of its internals [legos](./legos.md).

## What an IoC Enables

IoC's are not pervasive in the JavaScript ecosystem, but are staples in other languages/ecosystems. They provide several benefits:

- Loose coupling:
  - No hard dependencies between components, except on utility packages
  - Depend on interfaces rather than concrete implementations
  - Defer dependency resolution till runtime
- Testing: test without mocking/monkeypatching
- Scalability: no giant entrypoint file with manual instantiation of all nodes

Concretely, in the Exodus SDK, this enables:

- The SDK to be platform-agnostic and accept adapters on each platform
- Consumers to inject their own implementations of interfaces

## Nodes in the IoC

Though the IoC is a flat tree of nodes of the shape `{ id, factory, dependencies }`, we've also added a (lego) `type` field to enable useful pre-processing. Aside from the common node types: `'atom'`, `'module'`, `'api'`, and `'plugin'`, which correspond to [legos](./legos.md), there are a few special ones:

### atom-collection

An `atom-collection` is just an Object map for a group of atoms.

#### Examples

- [feature-flag-atoms](https://github.com/ExodusOSS/hydra/blob/master/features/feature-flags/atoms/feature-flag-atoms.js)
- [remote-config-feature-flags](https://github.com/ExodusOSS/hydra/blob/master/features/feature-flags/atoms/remote-config-feature-flags.js)

### report

A `report` node is used by `@exodus/headless` to assemble a debug report in case of a crash, via `exodus.reporting.export()`. Each feature can implement a `report` node, which will be added to the debug report namespaced at the feature's id.

#### Examples

- [address-provider](https://github.com/ExodusOSS/hydra/blob/master/features/address-provider/report/index.js)

### debug

A `debug` node is used by `@exodus/headless` to provide APIs at `exodus.debug` [in dev mode only](https://github.com/ExodusOSS/hydra/blob/master/sdks/headless#debugging). This is useful for mocking things at runtime, e.g. geolocation or wallet addresses.

#### Examples

- [address-provider](https://github.com/ExodusOSS/hydra/blob/master/features/address-provider/debug/index.js)
- [geolocation](https://github.com/ExodusOSS/hydra/blob/master/features/geolocation/debug/index.js)
- [wallet-accounts](https://github.com/ExodusOSS/hydra/blob/master/features/wallet-accounts/debug/index.js)

## Preprocessors

Preprocessors are functions that run before the IoC container is built. They can be used to modify the IoC node list before dependencies are resolved, e.g. to add a node, modify a node's dependencies, or wrap a node's factory. [For example](https://github.com/ExodusOSS/hydra/blob/master/libraries/dependency-preprocessors/src/preprocessors/performance-monitor.js#L3), if you want to time all methods of all nodes in the IoC, you could write a preprocessor that wraps each node's factory in a timing function and warns when it exceeds a certain threshold.

More on preprocessors in [dependency-preprocessors](https://github.com/ExodusOSS/hydra/tree/master/libraries/dependency-preprocessors).
