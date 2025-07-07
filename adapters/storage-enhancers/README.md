# `@exodus/storage-enhancers`

Storage enhancers for `@exodus/storage-spec` implementations.

## `namespacing`

Adds `storage.namespace(string)` method that returns a new storage instance with a namespace prepended to all keys.

```js
import withNamespacing from '@exodus/storage-enhancers/namespacing'

storage = withNamespacing(storage)
storage.namespace('foo').set('bar', 'baz')
```
