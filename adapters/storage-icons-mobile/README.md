# `@exodus/storage-icons-mobile`

Implementation of icons storage interface for mobile wallets.

Most likely you do NOT need to use this directly, but should opt for using `@exodus/adapters-mobile` instead, which will configure this for you.

## Usage

```js
import createExodus from '@exodus/headless'
import createIconsStorage from '@exodus/storage-icons-mobile'

const adapters = {
  // ...
  iconsStorage: createIconsStorage({
    config: {
      customTokensIconsEnabled: true,
      iconsPath: 'icons',
    },
  }),
}

const container = createExodus({ adapters, config })
```
