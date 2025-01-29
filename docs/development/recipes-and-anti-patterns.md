# Recipes and Anti-Patterns

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Default to Private Instance Methods and Variables](#default-to-private-instance-methods-and-variables)
- [Avoid globals & singletons](#avoid-globals--singletons)
- [Avoid Side-effects in Functional Code (filter, map, reduce, etc.)](#avoid-side-effects-in-functional-code-filter-map-reduce-etc)
- [Prefer polymorphism to switch statements](#prefer-polymorphism-to-switch-statements)
- [Wrap 3rd party libraries](#wrap-3rd-party-libraries)
- [First published package version should be 1.0.0 or 1.0.0-something](#first-published-package-version-should-be-100-or-100-something)
- [Peer Dependencies for Injected Dependencies](#peer-dependencies-for-injected-dependencies)
- [Avoid importing private modules from packages](#avoid-importing-private-modules-from-packages)
- [Don't Reimplement DB Features in JavaScript](#dont-reimplement-db-features-in-javascript)
- [SQL-in-JS vs SQL](#sql-in-js-vs-sql)
- [Error Handling: Don’t Swallow Errors](#error-handling-dont-swallow-errors)
- [Segregrate Statically and Dynamically Named](#segregrate-statically-and-dynamically-named)
- [Properties](#properties)
- [\_local_modules (`#/`) is reserved for future npm packages](#_local_modules--is-reserved-for-future-npm-packages)
- [Managing Feature Constants and Configuration in Mobile/Desktop/Browser Extension](#managing-feature-constants-and-configuration-in-mobiledesktopbrowser-extension)
- [Don't use yarn `resolutions` to patch `@exodus/` dependencies](#dont-use-yarn-resolutions-to-patch-exodus-dependencies)
- [Prefer Exporting Your Modules as Factory Functions](#prefer-exporting-your-modules-as-factory-functions)
- [Auto-bind methods](#auto-bind-methods)
- [null vs. undefined](#null-vs-undefined)
- [Error Handling: Avoid Blind catch-es](#error-handling-avoid-blind-catch-es)
- [Don’t write shell scripts](#dont-write-shell-scripts)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Recipes and Anti-Patterns

## Default to Private Instance Methods and Variables

**Details**

All functions and variables should be private unless they _must_ be public. Keep your public API as small as possible. Someone
will inevitably use anything you expose, forcing you to maintain it.

### Bad

```js
class Diego {
  // UNINTENTIONALLY PUBLIC API: this enrages Diegos everywhere
  // consequence: someone will see this is public and start using it
  cache = { dancing: false }
  // someone will see this is public and start using it
  dancingAtom = null
  // ...
  // someone will see this is public and start using it
  saveData = async (data) => {
  // important: this lets Diego start dancing immediately on next load()
    await this.dancingAtom.set(this.cache)
  }
  // INTENTIONALLY PUBLIC API
  load = async () => {
    this.cache = await this.dancingAtom.get()
  }
  dance = () => {
    this.cache.dancing = true
    await this.saveData()
  }
  stopDancing = async () => {
    if (this.cache.dancing) {
      throw new Error('sorry, no can do!')
    }
  }
}
```

### Good

Caveat: private properties are not inherited. If you want to make private properties available to subclasses, use the weaker \_
prefix convention instead, e.g. #saveData → \_saveData , or eschew classes altogether.

```js
class Diego {
  // everything with a ## is private
  #dancingAtom = null
  #cache = { dancing: false }
  // ...
  #saveData = async () => {
  // important: this lets Diego start dancing immediately on next load()
    await this.#dancingAtom.set(this.#cache)
  }
  // INTENTIONALLY PUBLIC API
  load = async () => {
    this.#cache = await this.#dancingAtom.get()
  }
  dance = () => {
    this.#cache.dancing = true
    await this.#saveData()
  }
  stopDancing = async () => {
    if (this.#cache.dancing) {
      throw new Error('sorry, no can do!')
    }
  }
}
```

## Avoid globals & singletons

**Details**

Why? If all arguments to your code are explicit, the code is less fragile, easier to understand and easier to test, similar to how a
pure function is easier to understand and test than an impure one. Globals and singletons create implicit
dependencies/arguments, and then what's worse, pollute everything downstream. Avoid this pollution at all costs or you will:

- Add implicit dependencies to all downstream code, or make it stateful when it doesn't need to be.
- Make downstream code difficult to separate/extract.
- Make testing extremely difficult:
  - Invite the use of extensive mocking and other anti-patterns.
  - Create unpredictable state in unit tests: 2 or more tests exercising the same instance may work differently depending
    on the execution order.

You should aim to rely on global state _only_ in the app entrypoint where you initialize all of your modules. From there, inject
initialized modules to any dependents.

Globals can come from:

- environment variables and command line args, e.g. process.env, process.argv
- globals like `window` and `globalThis`
- centralized configuration files, e.g. `import config from './config'`
- stateful imports, e.g. `import dbHandleSingleton from './db'`

Wait, is this even possible? Can we avoid global state completely? No, you may very well have a single instance of most
modules. However, you should avoid relying on this knowledge downstream. Use dependency injection to inject singletons to
avoid consumers relying explicitly on their singleton nature.

If your find yourself mocking a module in tests, consider injecting it rather than importing it.

### Bad

```js
// singleton-consumer.js
import singleton from '~/some-module-path'
// - this function lies about its 0 dependencies
// - testing is difficult because you depend on global state that isn't reset between tests
export default async function doStuff() {
  await singleton.doOtherStuff()
}
```

```js
// __tests__/singleton-consumer.test.js
jest.mock('../singleton', () => ({
  doOtherStuff: jest.fn(),
}))

import singleton from '../singleton'
import doStuff from '../singleton-consumer'

test('doStuff calls singleton', async () => {
  await doStuff()
  expect(singleton.doOtherStuff).toBeCalled()
})

afterAll(() => {
  jest.resetModules()
})
```

The above test works because it mocks the whole singleton module that's imported statically, BUT:

- It breaks the encapsulation of doStuff().
- Global module mocks need to be cleared between tests or test suites.
- Mocking modules is hacky. For example, how would you mock a package in Java or a module in python? IOC mocking is just
- a more natural and cross-language solution.
- It may depend on the order in which the mocked module is created.

### Good

```js
// - dependencies are explicit
// - testing is easy, just inject a new `preConstructedPreInitializedModule` instance in every test
export default ({ preConstructedPreInitializedModule }) => {
  return {
    doStuff: async () => {
      await preConstructedPreInitializedModule.doOtherStuff()
    },
  }
}
```

```js
// __tests__/singleton-consumer.test.js
//
// - no global mocks, only local mocks provided using dependency injection
import doStuffFactory from '../do-stuff'

test('doStuff calls IOC helper', async () => {
  const preConstructedPreInitializedModule = {
    doOtherStuff: jest.fn(),
  }

  await doStuffFactory({ preConstructedPreInitializedModule }).doStuff()
  expect(preConstructedPreInitializedModule.doOtherStuff).toBeCalled()
})
```

### Bad

```js
// calculator.js
//
// - project-level global singleton instantiated in its own module :(
// - testing is difficult
let calculator

const createCalculator = () => {
  // ...
}

export default function getCalculatorInstance() {
  return calculator || createCalculator()
}
```

```js
// app.js
//
// - we've already polluted `app.js` with global state
// - app.js requires refactoring before it can be extracted to a separate module
import calculator from './calculator'
// ...
export default app
```

### Good

```js
// calculator.js
//
// - export a factory function
export default function createCalculator(...args) {}
```

```js
// app.js
//
export default function createApp({ calculator, ...opts }) {
  // ...
  // use `calculator` without knowing how whether it's a singleton or not
}
```

```js
// entrypoint.js
//
```

```js
// we still only have a single instance, but nothing downstream needs to know this
const calculator = createCalculator()
// use dependency-injection to inject the instance to whoever needs it
const app = createApp({ calculator })
```

### Bad

```js
export default function createServer() {
  // you've polluted your module with global state!
  const { HOST: host = 'localhost', PORT: port = 3000 } = process.env
  // ...
}
```

### Good

```js
// server.js
// deps are explicit
export default function createServer({ host, port }) {
  // ...
}
```

```js
// entrypoint.js
//
// the only place you should be playing with globals
const { HOST: host = 'localhost', PORT: port = 3000 } = process.env
// use dependency-injection to inject the instance to whoever needs it
const server = createServer({ host, port })
```

### Bad

```js
// config.js
// shared global state. Anyone who imports this is infected by it.
const config = {}

const set = (data) => {
  merge(config, data)
}

// or even worse, `export default config`
const get = () => config
```

```js
export default { get, set }
```

```js
// app.js
//
// we've been infected by global state!
import config from './config'
```

### Good

```js
// config.js
export default function createConfig() {
  let config = {}

  const get = () => config
  const set = (data) => {
    config = merge({}, config, data)
  }

  return { get, set }
}
```

```js
// entrypoint.js
//
// the only place you should be playing with globals
const config = createConfig()
// yes, we still only have one instance of config and we inject that into app, but `app` doesn't know it!
const app = createApp({ config })
```

### Bad

```js
// remote-config.js
//
// - this is a global side-effect
// - the `config` module claims to know that it should prefetch data regardless of the
// app/environment/platform it's running in.
// This is a decision that affects global execution and should NOT be made by a low level library.
let fetchPromise = fetch(...)

export default async function fetchRemoteConfig() {
  return fetchPromise
}
```

### Good

```js
// remote-config.js
export default function createRemoteConfig() {
  let fetchPromise
  return {
    fetch: () => {
      if (!fetchPromise) fetchPromise = fetch(...)
      return fetchPromise
    },
  }
}
```

```js
// entrypoint.js
const config = createRemoteConfig()
// prefetch if needed
config.fetch()
```

### Exceptions

```
using process.env.SOME_FLAG to enable webpack to strip chunks of code in certain builds
disabling certain imports using environment detection
```

## Avoid Side-effects in Functional Code (filter, map, reduce, etc.)

**Details**

When you want to `map()` / `filter()` and perform another operation with the same array, it can be tempting to interleave the two tasks. Usually this gives negligible performance gains at the cost of readability and fragility. Where possible, separate the
two operations out.

### Bad

See side-effect inside `map()`.

```js
const upsert = async (orders) => {
  const pushToFusionPromises = []
  const syncedOrders = orders.map((order) => {
    if (!order.synced) {
      // side-effect to map()
      pushToFusionPromises.push(this.#pushToFusion(order))
    }
    return Order.fromJSON(order)
  })
  await Promise.all(pushToFusionPromises)
  // ...
}
```

### Good

No side-effects.

```js
const upsert = async (orders) => {
  const pushToFusionPromises = orders
    .filter((order) => !order.synced)
    .map((order) => this.#pushToFusion(order))

  const syncedOrders = orders.map((order) => Order.fromJSON(order))
  await Promise.all(pushToFusionPromises)
  // ...
}
```

## Prefer polymorphism to switch statements

**Details**

Switch statements are often an anti-pattern, because:

- They require the future developer to change existing code (dangerous) to support a new case vs adding new code (safe). In other words, they're commonly a violation of the Open Closed Principle.
- They typically require the future developer to change existing code in many places instead of the one place a particular implementer of an interface is defined.

### Bad

```js
// definition
// 1. to add support for a new asset, we need to change this business logic, which is dangerous
// 2. this is likely just one of many places we need to update per asset
const isSuccessfulOrder = ({ providerName, tx }) => {
  switch (providerName) {
    case '1inch':
      // ...
      break
    case 'switchain':
      // ...
      break
    // ...
  }
}
```

```js
// usage
isSuccessfulOrder({ providerName, tx })
```

### Good

```js
// #/providers/1inch.js
// 1. to add support for a new asset, we create a interface implementer
// 2. all changes for 1inch go in this one file
export default {
  // ...
  isSuccessfulOrder,
}
```

```js
// registry of interface implementers
// #/providers/index.js
import 1inch from './1inch'
export default {
// ...
1inch,
}
```

```js
// usage
import providers from '#/providers'

providers[providerName].isSuccessfulOrder(order)
```

#### Heuristic

To switch or not to switch, that is the...

If you're switching on something you expect to switch on in many different files, e.g. walletAccount.source, asset.name,
exchangeProvider.name, prefer polymorphism. If you're switching in isolation, e.g. on an error code, it's probably ok.

#### Examples

**Violations**

Switching on staking type:

```js
const getTitle = (type) => {
  switch (type) {
    case 'stake':
      return 'Staking…'
    case 'unstake':
      return 'Unstaking…'
    case 'claim':
      return 'Claiming…'
    case 'freeze':
      return 'Freezing…'
    case 'unfreeze':
      return 'Unfreezing…'
  }
}
```

This would be more readable and maintainable if written as a lookup object, e.g.:

```js
{
  [type]: { getTitle, getSubtitle, getScreenTitle }
}
```

**Acceptable Usage**

- reducers
- switching on an error code

## Wrap 3rd party libraries

**Details**

When wrapping a third-party library, protect downstream consumers by wrapping it in a sensible/minimal interface. Some day
you may want to replace it. This’ll be much easier if you don’t let its particular API details to leak downstream.

### Bad

```js
// #/language-detector
import LanguageDetect from 'languagedetect'

export default new LanguageDetect()
```

```js
// downstream code, e.g. #/news-processor
import languageDetector from '#/language-detector'
// we've now polluted our downstream business logic with third-party API specifics
const match = languageDetector.detect('some text', 1)?.[0]?.[0]
```

### Good

```js
// #/language-detector
import LanguageDetect from 'languagedetect'

const detector = new LanguageDetect()
// wrap the third party API, with an API that makes sense for our first few use cases
const detectLanguage = (text) => {
  const matches = detector.detect(text, 1)
  return matches?.[0]?.[0]
}

export default { detectLanguage }
```

```js
// downstream code, e.g. #/news-processor
import languageDetector from '#/language-detector'
// we've now shielded downstream code from third-party API specifics
// we can now replace the 'languagedetect' module without breaking downstream code
const match = languageDetector.detectLanguage('some text')
```

## First published package version should be 1.0.0 or 1.0.0-something

**Details**

Semver resolution not only behaves differently for versions before 1.0.0, but the [semver](https://www.npmjs.com/package/semver) package and [semver spec](https://semver.org/) behave differently in some cases.

See example behaviors pre-1.0.0 below. There are others, but hopefully you're already convinced.

- ^1.0.0 can resolve to 1.0.1 or 1.1.0 but ^0.0.1 can NOT resolve to 0.0.2 or to 0.1.
- despite the above, ~0.0.1 CAN resolve to 0.0.

An exception to this rule is when you're fork a third party package, in which case you should match their versioning scheme,
e.g. `react-native-reanimated@6.0.0` -> `react-native-reanimated@6.0.0-exodus.0` or `react-native-reanimated@0.5.0` -> `react-
native-reanimated@0.5.0-exodus`.

## Peer Dependencies for Injected Dependencies

**Details**

With dependency injection you accept an interface for a dependency rather than a specific module or a specific version of that
module. When both the dependency and the dependent are written in TypeScript, you can rely on compile-time interface
validation. When either one is written in JavaScript, you don't have that luxury. To partially mitigate the issue, add
peerDependencies to your module for any published modules it receives via dependency injection. This doesn't validate that the
dependency passed in is actually an instance of a module with a compatible interface, but it does warn the developer at install
time.

## Avoid importing private modules from packages

**Details**

Don't import a package's private exports. Anything defined in package.json main/exports is public, everything else is private.

### Bad

```js
import { deserialize } from '@exodus/models/lib/account-state/serialization'
```

### Bad

```js
import { ethereum as feeData } from '@exodus/ethereum-lib/src/fee-data'
```

#### Issues

- It imports a private functionality breaking encapsulation.
- It uses `/lib` and `/src` folders. These are related to how the package is built and might change.

#### Alternatives:

- Use a top-level export.
- Export the module via the top-level index.js.
- Split the package if you just want to use that module for bundle size reasons.
- Reevaluate the package's cohesiveness to see why consumers are importing one of its low-level modules.

## Don't Reimplement DB Features in JavaScript

**Details**

Avoid using iterative knex queries and JS transformations for anything other than trivial lookups. Prefer SQL queries, and let the
DB query engine optimize. This will also enable you to run those same queries in the postgres CLI when testing/debugging.

### Bad

```js
const getRewardsHistory = async (address) => {
  const wallet = await db.wallets.get({ address })
  const rewards = await db.rewards.filter({ publicKey: wallet.publicKey })
  res.json({
    data: {
      wallet,
      rewards: rewards.sort(sortByDateDesc).map(exportReward),
    },
  })
}
```

### Good

```sql
// rewards-history.sql
select
to_json(wallets.*) as "wallet",
to_json(rewards.*) as "reward"
from wallets
join rewards on users.public_key = rewards.public_key
...
where rewards.created_at < (?)
order by rewards.created_at desc
```

```js
// db/rewards.js
const rewardsHistoryQuery = require('./rewards-history.sql')
const getRewardsHistory = async ({ address, startDate }) => {
  const rows = await knex.raw(rewardsHistoryQuery, [startDate])
  // ...
}
```

## SQL-in-JS vs SQL

**Details**

We use [knex](https://knexjs.org/) query builder in many backend projects. Sometimes we overuse its SQL-in-JS capabilities where raw SQL is best.
Here’s a meta-rule for when to use which:

Knex is great for:

- migrations
- simple queries like insert/update/delete, where unwrapping a JS object into a list of fields would be a pain
- dynamically constructed queries, e.g. where you assemble a query out of 3-5 conditions depending on some runtime application logic
- supporting multiple SQL-based dbs (though we pretty much settled on Postgres at Exodus)
- preventing SQL injection

For other cases, e.g. for non-dynamically constructed queries, prefer knex.raw + raw SQL.

- `knex` provides no benefit, just an additional abstraction layer.
- We can assume all devs working on a SQL-DB-based backend either already know SQL or are learning it. We can’t make the same assumption about knex’s large and quirky API surface. Today it’s knex, tomorrow or in some other project it’s prisma or objection or some other ORM or query builder. SQL is the common denominator.
- Being able to quickly test out a SQL query in some Postgres CLI or GUI is very useful when debugging and developing.
- Translating that query back to knex is unnecessary overhead and makes the next debugging session harder.

### Bad (Mark 2021)

```js
getTable()
  .select(knex.raw('recovery_requests.*, users.date_setup'))
  .where('recovery_requests.recovery_id', '=', recoveryId)
  .andWhere(knex.raw('recovery_requests.date_fulfilled is null'))
  .andWhere(knex.raw('recovery_requests.date_canceled is null'))
  .join('users', 'users.recovery_id', 'recovery_requests.recovery_id')
  .first()
```

### Good (Mark 2020)

```sql
SELECT
o.*,
m.asset_amount,
f.pull_funds_status,
f.instant_settlement_status,
f.error as fiat_deposit_error,
m.error as market_maker_order_error
FROM
orders o
JOIN fiat_deposits f on f.id = o.fiat_deposit
LEFT JOIN market_maker_orders m on m.parent_order_id = o.id
WHERE
o.user_public_key = (?);
```

## Error Handling: Don’t Swallow Errors

**Details**

Rules of thumb:

- Let errors bubble up unless you know exactly how to handle them.
- Avoid swallowing errors in low-level libraries/modules, e.g. in exodus-hydra modules.
- Don’t return null / undefined to indicate failure.
- Avoid giant try/catch statements. It should be clear from the `try/catch` what might throw and why.
- See also [Error Handling: Avoid Blind catch-es](#error-handling-avoid-blind-catch-es)

### Bad

```js
fetchStuff = async () => {
  try {
    return await fetchival(this.#url).get()
  } catch (err) {
    console.error(err)
  }
}
```

```js
// example filesystem-based storage module
remove = async (key) => {
  try {
    // we're swallowing this error, probably unintentionally!
    validateKey(key)
    await fs.promises.unlink(`${this.#dir}/${key}`)
  } catch (err) {
    // it may makes sense to swallow the error if the file does not exist
    // but definitely NOT for many types of errors
  }
}
```

```js
// example filesystem-based storage module
const get = async (key) => {
  try {
    // we're swallowing this error, probably unintentionally!
    validateKey(key)
    return await fs.promises.readFile(`${this.#dir}/${key}`)
  } catch (err) {
    // it may makes sense to return `null` here if the key doesn't exist,
    // but definitely NOT for many types of errors
    return null
  }
}
```

### Good

```js
// let the error bubble up to where a higher-level module
// can decide what to do with it
fetchStuff = async () => {
  return fetchival(this.#url).get()
}
```

```js
// example filesystem-based storage module
remove = async (key) => {
  // definitely rethrow this!
  validateKey(key)
  try {
    await fs.promises.unlink(`${this.#dir}/${key}`)
  } catch (err) {
    // it may makes sense to swallow the error if the file does not exist
    // but definitely NOT for many types of errors
  }
}
```

```js
// example filesystem-based storage module
get = async (key) => {
  // definitely rethrow this!
  validateKey(key)
  try {
    return await fs.promises.readFile(`${this.#dir}/${key}`)
  } catch (err) {
    // for the special case of file not found we've decided to return null
    if (err.code === 'ENOENT') return null
    throw err
  }
}
```

### Exceptions

There are exceptions when swallowing an error is valid behavior. For example [`analytics.track()`](https://github.com/ExodusOSS/hydra/blob/8ac3c1382e3d51923de4d73c43c32f92005ae351/features/analytics/module/index.js#L200) swallows all errors internally, which might be ok because analytics is like a remote logger and you’d never want `console.log` to fail (h/t @ryanzim for the analogy)

## Segregrate Statically and Dynamically Named

## Properties

**Details**

If you need to support dynamic property names, segregate them into a separate object so they don't mix with or accidentally
clobber statically named properties. Better yet, figure out a way to avoid dynamically named properties altogether, they make
for a confusing and hard to parse API surface.

### Bad

See [UnitType](https://github.com/ExodusOSS/hydra/blob/8ac3c1382e3d51923de4d73c43c32f92005ae351/libraries/currency/src/unit-type.js#L45). This results in dynamic property names like `currency.BTC`, `currency.Gwei`, etc., which are unpredictable and
potentially conflict with `currency.ZERO`, `currency.defaultUnit`, `currency.toString()`, etc.

### Better

See [UnitType.units](https://github.com/ExodusOSS/hydra/blob/8ac3c1382e3d51923de4d73c43c32f92005ae351/libraries/currency/src/unit-type.js#L17).

### Good

Avoid dynamically named properties. If you find yourself needing them, post on #development in Slack for help on
brainstorming alternatives.

## \_local_modules (`#/`) is reserved for future npm packages

**Details**

If it's not meant to be extracted to an npm package, don't put it in `_local_modules`.

### Bad

```
#/app-constants
#/app-config
```

### Good

```
#/date-util
#/exchange-client
#/fiat-client
```

## Managing Feature Constants and Configuration in Mobile/Desktop/Browser Extension

**Details**

### Bad

- Don't keep constants for various features in `#/app-constants` | `#/app-config`. Anything under `#` (`_local_modules`), is destined for extraction to npm. A collection of constants across different features doesn't make a coherent npm package.
- Don't scatter feature flags, e.g. const MY_NAUGHTY_FEATURE_ENABLED = isDev, across many `~/constants/<my-naughty-feature>.js` files. This makes it difficult to tell at a glance which features are enabled.
- Don't move constants out of your feature folder `#/<my-naughty-feature>/` into a dedicated constants file like `~/constants/<my-naughty-feature>.js` unless you have to, as this makes your feature hard to extract to an npm package. A good reason to break this rule is when your constant isn't a constant at all, but a configuration variable. See below for how to handle that case.

### Good

- Keep anything that's actually constant, e.g. an enum, inside your feature folder.
- Keep feature flags, e.g. const `MY_NAUGHTY_FEATURE_ENABLED = isDev` in a global feature flags file `~/constants/features.js`
- Keep platform/env/build-specific configuration like `apiUrl` in `~/constants/<my-well-behaved-feature>.js`.
- Dependency-inject it into your feature module constructor/factory.
- When you publish your module to npm, export your constants explicitly from `@exodus/<my-well-behaved-
feature>/constants.js` to make them importable in the client repos.

## Don't use yarn `resolutions` to patch `@exodus/` dependencies

**Details**

yarn resolutions are for pinning sub-dependencies of modules we can't control. If we control the module itself, we should just
update the module to use the sub-dependency we want.

### Bad

```json
"resolutions": {
  "@exodus/currency": "2.1.2",
  "**/@exodus/solana-web3.js/secp256k1": "file:_local_modules/you-shall-not-pass/secp256k1/",
}
```

### Good

```json
"resolutions": {
  "electron/@types/node": "file:src/app/_local_modules/you-shall-not-pass/empty",
}
```

## Prefer Exporting Your Modules as Factory Functions

**Details**

Note: this has turned out to be somewhat controversial, so feel free to ignore this for now.

Prefer exporting a factory function to exporting a class. Consumers shouldn't need to know if your module is implemented as a
class or a bag of functions unless they must, e.g. for inheritance. You can still use classes, you just don’t need to leak that
implementation detail to the consumer.

### May be unnecessary, unless you have a strong use case for inheritance:

```js
export default class Andrej {
  // ...
}
```

### Reduces the consumer’s assumptions for the public API, while retaining flexibility for internal implementation details/preferences:

```js
// use a class if you want, but don't export it unless you have to
class Andrej {
  // ...
}

const createAndrej = (opts) => new Andrej(opts) // I wish it were this easy

export default createAndrej
```

## Auto-bind methods

**Details**

Consumers should be able to treat your module as a bag of functions and not worry about whether they need to bind your
API's methods to the instance: fede.dance.bind(fede). To enable this, auto-bind any class instance methods.

### Bad

```js
class Fede {
  dance() {
    this._logger.debug('ladies, watch this')
    // depending on how you consume this, you may get `Error: can't read property 'debug' of undefined`
  }
}
```

### Good

Caveat: methods auto-bound as below will NOT be defined on the prototype. If you expect to subclass your class and you want
methods available via super.superClassMethod(), you can bind methods in the constructor instead, e.g. this.dance =
this.dance.bind(this)

```js
class Fede {
  // auto-bind happens courtesy of https://babeljs.io/docs/en/babel-plugin-proposal-class-properties
  dance = () => {
    this._logger.debug('ladies, watch this')
  }
}
```

## null vs. undefined

**Details**

If you are working with APIs and considering if you should return undefined or null for a property, you might think that there’s
essentially no difference from the client perspective, but there are a few, and long story short you should use undefined unless
( _keep reading._ )

### Why use undefined over null?

The first and most important is when deconstructing the response object, with null you have a defined value, so it won’t
default to a specific value, for example:

```js
const { favoriteAssetName = 'bitcoin' } = { name: null }
// `favoriteAssetName` here will be `null`.
const { favoriteAssetName = 'bitcoin' } = { name: undefined }
// `favoriteAssetName` here will be 'bitcoin'.
```

When stringifying the value (which is always the case when responding from an network-based API) the key will also go away.
For example:

```js
JSON.stringify({ name: undefined })
// '{}'
JSON.stringify({ name: null })
// '{name:null}'
```

That means that the network response is smaller, but the shape changed so it could be confusing for the client. Be aware of
that.

### When to use null?

If what you are returning is a value that shouldn’t be defaulted and you actually want to imply that the reference to this does
not exist (such in a classical pointer or reference).

For example:

```js
{
  name: 'My name',
  employeeId: null
}
```

## Error Handling: Avoid Blind catch-es

**Details**

Avoid catch blocks that blindly ignore all errors. These ignore not only expected errors thrown by downstream code, but also
what are likely developer errors, e.g. TypeError, SyntaxError, RangeError, etc.

### Bad

```js
const doSomethingDangerous = ({ quickly }) => {
  defuseBomb({ quickly })
  takeOffUnderwearWithoutTakingOffPants({ quickly })
}

try {
  // throws TypeError: Cannot destructure property 'quickly' of 'undefined'
  // this is probably not the error you wanted to ignore!
  doSomethingDangerous()
} catch {}
```

### Good

```js
try {
  doSomethingDangerous()
} catch (err) {
  if (/* check that this error is expected */) return

  // at the very least, log the error
  logger.error('WARNING: this is probably a developer error', err)
  // in many cases you'll want to rethrow
  throw err
}
```

## Don’t write shell scripts

**Details**

tl;dr: merciful Tehlu! Just write your script in JS, for all our sakes.

From the automation king @sparten11740:

> wrt bash: I love writing myself a nice bash script and used to do that quite a bit. Sometimes it feels like solving a good puzzle, but the testability and debuggability is a catastrophe. Also everyone here uses eslint, does everyone use shell check? I doubt it. We have a lot of bash scripts that incorporate bad practices and they get copied around and the practices spread 😅. Much easier for everyone to follow (and work on) a small commander/yargs/whatnot node cli
