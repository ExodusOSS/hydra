# `@exodus/atoms`

## Install

```sh
    yarn add @exodus/atoms
```

## What is an atom?

An atom is a data source wrapper that exposes a single piece of data through 3 different methods:

- **get()**: read data
- **set(newValue)**: sets the atoms value, blocking until all observers have resolved.
- **observe(async (data) => {})**: observes data changes. Will be called initially with current data value. Observers are awaited in series.
- **reset()**: clear the stored value. The next `get()` call will return the default value\* and observers will be called with the default value.

## Data sources

This library provides helpers for creating atoms from multiple data sources we use in our apps.

|               | get | set   | observe |
| ------------- | --- | ----- | ------- |
| Memory        | ✅  | ✅    | ✅      |
| Storage       | ✅  | ✅    | ✅      |
| Keystore      | ✅  | 🟡 \* | ✅      |
| Event emitter | ✅  | ❌    | ✅      |

\* A keystore atom needs a special `isSoleWriter` param to allow write access.

See also:

- [@exodus/remote-config-atoms](../remote-config-atoms)
- [@exodus/fusion-atoms](../fusion-atoms)

Note: this library originally hosted a bunch of media-specific factories, which have since been moved out, like the two above. The above will likely follow suit, and this library will only implement the common media-agnostic atom behaviors.

## Troubleshooting

Theoretically all atoms should behave similarly. In practice, there are a few currently inconsistent behaviors, which we aim to fix in the future, particularly around memory atoms and atoms created from an event emitter:

- Memory atoms hang on `get()` if no `defaultValue` is provided.
- Memory and Event Emitter atom observers are non-blocking, i.e. `memoryAtom.set()` is fire-and-forget

## Usage

```js
import { EventEmitter } from 'events'
import {
  createInMemoryAtom,
  createStorageAtomFactory,
  fromEventEmitter,
  createKeystoreAtom,
} from '@exodus/atoms'

// In memory atoms
const availableAssetNamesAtom = createInMemoryAtom({
  defaultValue: {},
})

// Storage atoms
const storageAtomFactory = createStorageAtomFactory({ storage })

const acceptedTermsAtom = storageAtomFactory({
  key: 'acceptedTerms',
  defaultValue: false,
  isSoleWriter: true,
})

// Event emitter
const geolocation = new EventEmitter()
const geolocationAtom = fromEventEmitter({
  emitter: geolocation,
  event: 'geolocation',
  get: async () =>
    new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject)),
})

navigator.geolocation.watchPosition((position) => {
  geolocation.emit('geolocation', position)
})

// keystore
const keystoreAtom = createKeystoreAtom({
  keystore, // see @exodus/keystore-mobile
  config: {
    key: 'my-secret',
    defaultValue, // optional
    isSoleWriter, // if you plan to call set() on this atom instance
  },
})
```

## Enhancers

To compute derived values, combine multiple atoms into, and perform other useful derivations, there are a bunch of enhancers available. Below is a non-exhaustive list, so check out [./src/enhancers](https://github.com/ExodusOSS/hydra/tree/master/libraries/atoms/src/enhancers) for more.

### compute({ atom, selector }): ReadonlyAtom

Computes an atom from another by applying a selector function to the observed data source.

Example:

```js
import { createInMemoryAtom, compute } from '@exodus/atoms'

const yearAtom = createInMemoryAtom({ defaultValue: 2025 })

const isDoorsOfStoneOutYetAtom = compute({
  atom: yearAtom,
  selector: (year) => year > 2040,
})

isDoorsOfStoneOutYetAtom.observe(console.log) // false
```

### combine({ [key]: Atom }): ReadonlyAtom

Combines multiple atoms into one:

- `combinedAtom.observe`: fires for the first time when all atoms have emitted a value.
- `combinedAtom.get`: resolves to an object with the values of all atoms as keyed in the input.

Example:

```js
import { createInMemoryAtom, combine } from '@exodus/atoms'

const nameAtom = createInMemoryAtom()
const ageAtom = createInMemoryAtom()
const userAtom = combine({
  name: nameAtom,
  age: ageAtom,
})

userAtom.observe(console.log) // hangs until both name and age are set
nameAtom.set('Voldemort')
ageAtom.set(25)
// userAtom atom fires with { name: 'Voldemort', age: 25 }
```

### dedupe(atom)

By default, atoms perform a shallow equality check to determine if a newly written value differs from the current one, and avoid notifying observers if it doesn't. If you want a deep equality check, use `dedupe`. (Even better, don't write deeply equal objects to that atom in the first place, and don't use `dedupe`!)

Example:

```js
import { createInMemoryAtom, dedupe } from '@exodus/atoms'

const userAtom = createInMemoryAtom({ defaultValue: { name: 'Voldemort', age: 25 } })
const dedupedUserAtom = dedupe(userAtom)
userAtom.set({ name: 'Voldemort', age: 25 }) // `userAtom` observers are notified
dedupedUserAtom.set({ name: 'Voldemort', age: 25 }) // `dedupedUserAtom` observers are NOT notified
```

### withSerialization({ atom, serialize, deserialize })

If you're storing data in an atom that needs to (de)serialize it, e.g. a storage atom, and the data doesn't survive a roundtrip through JSON.stringify / JSON.parse, use `withSerialization` to provide custom serialization.

Example:

```js
import BJSON from 'buffer-json'
import { createInMemoryAtom, withSerialization } from '@exodus/atoms'

const rawPublicKeysAtom = createInMemoryAtom()
const publicKeysAtom = withSerialization({
  atom: rawPublicKeysAtom,
  serialize: BJSON.stringify,
  deserialize: BJSON.parse,
})

publicKeysAtom.set({
  bitcoin: Buffer.from([...]),
  ethereum: Buffer.from([...]),
})
```

### difference(atom)

If you want to get both the current and previous value emitted by an atom, use `difference`.

Example:

```js
import { createInMemoryAtom, difference } from '@exodus/atoms'

const nameAtom = createInMemoryAtom({ defaultValue: 'Tom' })
const nameChangeAtom = difference(nameAtom)
nameChangeAtom.observe(console.log)
nameAtom.set('Voldemort')
// nameChangeAtom emits
// { previous: 'Tom', current: 'Voldemort' }
```

### filter(atom, predicate)

If you're only interested in a subset of values an atom emits, use `filter`:

Example:

```js
import { createInMemoryAtom, filter } from '@exodus/atoms'

const nameAtom = createInMemoryAtom({ defaultValue: 'Tom' })
const unusualNameAtom = filter(nameAtom, (name) => !['Tom', 'Dick', 'Harry'].includes(name))
unusualNameAtom.observe(console.log)
nameAtom.set('Dick') // unusualNameAtom doesn't emit
nameAtom.set('Harry') // unusualNameAtom doesn't emit
nameAtom.set('Voldemort') // unusualNameAtom emits 'Voldemort'
```
