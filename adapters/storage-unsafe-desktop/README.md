# `@exodus/storage-unsafe-desktop`

An implementation [unified storage spec](https://github.com/ExodusMovement/exodus-hydra/blob/master/modules/storage-spec/spec.md) on top of Node.js's `fs` module. "Unsafe" = no encryption out of the box.

## Usage

```js
const { createStorage } = require('@exodus/storage-unsafe-desktop')

const storage = createStorage({
  file: 'path/to/unsafe-storage.json', // creates new or loads existing file
})

await storage.set('foo', 'bar') // etc.
// use as any other `@exodus/storage-spec` compliant interface
```

### `isStorageWriting()`

Check if storage is currently writing before killing the application to prevent corruption.

**NOTE:** synchronous filesystem call!

```js
const { isStorageWriting } = require('@exodus/storage-unsafe-desktop')

isStorageWriting('path/to/storage.json')
// returns true or false
```
