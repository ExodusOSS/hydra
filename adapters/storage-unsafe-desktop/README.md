# `@exodus/storage-unsafe-desktop`

An unsafe implementation of the [storage spec](https://github.com/ExodusMovement/exodus-hydra/blob/master/modules/storage-spec/spec.md).

## Usage

```js
const { createStorage } = require('@exodus/storage-unsafe-desktop')

const storage = createStorage({
  file: 'path/to/unsafe-storage.json', // creates new or loads existing file
})

await storage.set('foo', 'bar') // etc.
```

### `isStorageWriting()`

Check if storage is currently writing before killing the application to prevent corruption.

**NOTE:** synchronous filesystem call!

```js
const { isStorageWriting } = require('@exodus/storage-unsafe-desktop')

isStorageWriting('path/to/storage.json')
// returns true or false
```
