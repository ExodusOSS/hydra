# @exodus/basic-utils

[![npm](https://img.shields.io/npm/v/@exodus/basic-utils.svg?style=flat-square)](https://www.npmjs.com/package/@exodus/basic-utils)

Lightweight lodash-like utils commonly used in Exodus projects.

## Install

```
yarn add @exodus/basic-utils
```

## Usage

### SynchronizedTime

```js
import { SynchronizedTime } from '@exodus/basic-utils'

console.log(SynchronizedTime.now())
```

### cleanInput

```js
import { cleanInput } from '@exodus/basic-utils'

cleanInput('1.2abc@!#') // returns 1.2
```

## flattenToPaths

Flatten an object to an array of `[...path, leafValue]` arrays.

```js
import { flattenToPaths } from '@exodus/basic-utils'

flattenToPaths({
  harry: {
    wand: 'holly',
  },
  grindie: {
    wand: 'yew',
  },
  voldie: {
    wand: 'yew',
  },
})

// [
//   ['harry', 'wand', 'holly'],
//   ['grindie', 'wand', 'yew'],
//   ['voldie', 'wand', 'yew'],
// ]
```

```

```

## Lodash-like utility functions

The [following functions](./src/lodash.js) work like their lodash counterparts, with some caveats:

- They're strict with respect to arguments, and don't support multiple options like arrays, strings, etc. For example, `pick(users, ['name', 'age'])` but NOT `pick(users, 'name')`. Please see the tests before you use them.
- Functions that create objects return objects with a null prototype.

Before using a function, check its unit tests to make sure you're using the API correctly.

```js
import {
  pick,
  pickBy,
  omit,
  mapKeys,
  mapValues,
  keyBy,
  orderBy,
  isNil,
  isObjectLike,
  isPlainObject,
  difference,
  intersection,
  partition,
  set,
} from '@exodus/basic-utils'
```

## async helpers

See [./src/async.js](./src/async.js) and [./src/p-debounce.js](./src/p-debounce.js) for more details.

- `mapValuesAsync`, `filterAsync`, `partitionAsync` are the async counterparts of `mapValues`, `filter`, `partition` respectively.
- `pDebounce`: [p-debounce](https://www.npmjs.com/package/p-debounce), copied from the original temporarily to avoid having to ship this as ESM.

## Prototype pollution safety

- [getOwnProperty](./src/get-own-property.js)
- [defineProperty](./src/define-property.js)
