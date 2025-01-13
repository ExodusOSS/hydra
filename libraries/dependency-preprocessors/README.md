# @exodus/dependency-preprocessors

IOC preprocessor functions

## Usage

Run built-in and custom preprocessors as follows:

```js
import createIocContainer from '@exodus/dependency-injection'
import preprocess from '@exodus/dependency-preprocessors'
import logify from '@exodus/dependency-preprocessors/src/preprocessors/logify'
import config from '@exodus/dependency-preprocessors/src/preprocessors/config'
import alias from '@exodus/dependency-preprocessors/src/preprocessors/alias'
import namespaceStorage from '@exodus/dependency-preprocessors/src/preprocessors/namespace-storage'

const createLogger =
  (namespace) =>
  (...args) =>
    console.log(namespace, ...args)

const ioc = createIocContainer({ logger: createLogger('exodus:ioc') })

const customPreprocessor = ({ definition, ...extras }) => ({ definition, ...extras })
const deps = preprocess({
  dependencies: createDependencies({ adapters, config }),
  preprocessors: [
    //
    logify({ createLogger }),
    config(),
    alias(),
    namespaceStorage(),
    customPreprocessor,
  ],
})

ioc.registerMultiple(deps)
ioc.resolve()
```

## Preprocessors

### logify

Pass a namespaced logger instance

```js
import createIocContainer from '@exodus/dependency-injection'
import preprocess from '@exodus/dependency-preprocessors'

const createLogger =
  (namespace) =>
  (...args) =>
    console.log(namespace, ...args)

const ioc = createIocContainer({ logger: createLogger('exodus:ioc') })

const deps = preprocess({
  dependencies: [
    {
      definition: {
        id: 'myModule',
        factory: ({ logger }) => logger.warn('sync finished'), // Logs will be prefixed with [myModule:warn]
      },
    },
  ],
  preprocessors: [logify({ createLogger })],
})

ioc.registerMultiple(deps)
ioc.resolve()
```

### config

Performs global config auto-binding given module id, or injection from a node if it has "config" defined on it.

```js
import createIocContainer from '@exodus/dependency-injection'
import preprocess from '@exodus/dependency-preprocessors'
import config from '@exodus/dependency-preprocessors/src/config'

const createLogger =
  (namespace) =>
  (...args) =>
    console.log(namespace, ...args)

const ioc = createIocContainer({ logger: createLogger('exodus:ioc') })

const deps = preprocess({
  dependencies: [
    {
      definition: {
        id: 'config',
        factory: () => ({ myModule: { apiUrl: 'https://exodus.com' } }),
      },
    },
    {
      definition: {
        id: 'myModule',
        factory: ({ config }) => config.apiUrl,
        dependencies: ['config'],
      },
    },
    {
      definition: {
        id: 'nodeInjected',
        factory: ({ config }) => config.potter.spells, // [lumos]
        dependencies: ['config'],
      },
      config: {
        potter: {
          spells: ['lumos'],
        },
      },
    },
  ],
  preprocessors: [config()],
})

ioc.registerMultiple(deps)
ioc.resolve()
```

### alias

Alias injected dependencies, e.g. so you can inject a global dependency `myMobileImplementationOfSomething` as a locally named option `something` to a module.

See [example](./__tests__/examples/voldemort-roulette.test.js).

### namespaceStorage

Namespaces the storage injected to your dependency.

See [example](./__tests__/examples/namespace-storage.test.js).

### readOnlyAtoms

Makes all atoms readonly unless configured to be writeable

```js
import readOnlyAtoms from '@exodus/dependency-preprocessors/src/preprocessors/read-only-atoms'

const deps = preprocess({
  dependencies: [
    {
      definition: {
        id: 'balances',
        factory: () => ({ myModule: { apiUrl: 'https://exodus.com' } }),
        dependencies: ['currencyAtom', 'balancesAtom'],
      },
    },
  ],
  preprocessors: [readOnlyAtoms()],
})
```

To warn instead of throw, set the `warn` flag to `true` and inject a logger instace:

```js
import readOnlyAtoms from '@exodus/dependency-preprocessors/src/preprocessors/read-only-atoms'

const deps = preprocess({
  // ...
  preprocessors: [readOnlyAtoms({ warn: true, logger: createLogger('readOnlyAtoms') })],
})
```

### optional

Allows conditionally adding dependencies using the `if` property:

```js
import optional from '@exodus/dependency-preprocessors/src/preprocessors/optional'

const deps = preprocess({
  dependencies: [
    {
      if: ENABLE_OPTIMISTIC_ACTIVITY,
      definition: {
        id: 'optmisticBalances',
        factory: () => ({ myModule: { apiUrl: 'https://exodus.com' } }),
        dependencies: ['balancesAtom'],
      },
    },
  ],
  preprocessors: [optional()],
})
```

### devModeAtoms

Helps detect various well-known issues with atoms

```js
import devModeAtoms from '@exodus/dependency-preprocessors/src/preprocessors/dev-mode-atoms'

const deps = preprocess({
  dependencies,
  preprocessors: [
    devModeAtoms({
      logger,
      // throw when observers seem to hang
      timeoutObservers: {
        delay: 1000,
      },
      // warn is set() is called with the same value as the current value
      warnOnSameValueSet: true,
      // warn when observers throw/reject instead of crashing set()
      swallowObserverErrors: true,
    }),
  ],
})
```

### performanceMonitor

Wraps method calls to IOC nodes in a proxy that notifies about the execution time of methods which exceed a configures threshold.

```js
import performanceMonitor from '@exodus/dependency-preprocessors/src/preprocessors/performance-monitor'

const deps = preprocess({
  dependencies,
  preprocessors: [
    performanceMonitor({
      now: performance.now, // default
      onAboveThreshold: ({ id, method, duration }) => {
        console.log(`[exodus:${id}:perf]`, `${method} took ${duration}ms`)
      },
      config: {
        threshold: 50, // default, logs any method calls taking longer than 50ms
      },
    }),
  ],
})
```

### order

The order preprocessor changes the order of nodes before passing them on to the IoC, based on the order configuration.
In the below example `weasleySpells` will be reordered to come before `potterSpells`.

```js
import order from '@exodus/dependency-preprocessors/src/preprocessors/order'

const deps = preprocess({
  dependencies: [
    {
      definition: {
        id: 'potterSpells',
        factory: () => ['lumos'],
      },
    },
    {
      definition: {
        id: 'weasleySpells',
        factory: () => ['lumos', 'wingardium leviosa'],
      },
      order: {
        before: ['potterSpells'],
      },
    },
  ],
  preprocessors: [order()],
})
```
