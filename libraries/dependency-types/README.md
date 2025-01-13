# @exodus/dependency-types

This package ships types for dependency injection definitions, nodes, and features. The types are separate from `@exodus/dependency-injection`/`@exodus/argo` to avoid circular dependencies.

## Install

```sh
yarn add @exodus/dependency-types
```

Consider using the `-D` flag in JS projects or TS projects that don't re-export any types from this package.

## Usage

If you're working on a typescript feature, you should type your definitions or features with `satisfies` expressions. Here's an example of a definition:

```ts
import type { Definition } from '@exodus/dependency-types'

const batmobileDefinition = {
  // the type guarantees auto-complete and the correct shape of the definition
} as const satisfies Definition
```

Avoid using a direct type annotation as it changes the type of properties such as `id` or `type` to `string` instead of their concrete values. These are required for statically deriving the type of the exodus api. Definitions can be used as part of a feature or directly registered in a [dependency-injection](../../libraries/dependency-injection/) container instance.

To type a feature factory, use the `Feature` type:

```ts
import type { Feature } from '@exodus/dependency-types'

const batmobileFeature = () =>
  ({
    id: 'batmobile',
    definitions: [],
  }) as const satisfies Feature
```

A feature can be registered with [@exodus/argo](../../sdks/argo/) or [@exodus/headless](../../sdks/headless/).

In JS packages, jsdocs can be used to document the types:

```js
/**
 * @typedef {import('@exodus/dependency-types').Definition} Definition
 * @typedef {import('@exodus/dependency-types').Feature} Feature
 */

/** @type {Definition} */
const batmobileDefinition = {
  id: 'batmobile',
  type: 'module',
  // ...
}

const batmobileFeature = () => {
  /** @type {Feature} */
  const feature = {
    id: 'batmobile',
    definitions: [],
  }

  return feature
}
```
