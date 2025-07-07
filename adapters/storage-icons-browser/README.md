# `@exodus/storage-icons-browser`

Implementation of icons storage interface for browser extensions.

## Usage

```js
import createExodus from '@exodus/headless'
import createIconsStorage from '@exodus/storage-icons-browser'
import createUnsafeStorage from '@exodus/browser-extension-adapters/unsafe-storage'

// icons don't need to be encrypted
const unsafeStorage = createUnsafeStorage({ store: chrome.storage.local })
const adapters = {
  // ...
  iconsStorage: const iconsStorage = createIconsStorage({
    storage: unsafeStorage.namespace('customTokens').namespace('icons'),
  }
}

const container = createExodus({ adapters, config })
```
