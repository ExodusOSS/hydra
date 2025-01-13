# @exodus/app-process-mobile

## Usage

To use with the exodus sdk:

```js
import appProcess from '@exodus/app-process-mobile'

exodus.use(appProcess())
// ...
exodus.resolve()

// The module exposes api methods that can be used to await the app state:
await exodus.appProcess.awaitForeground()
```

Alternatively attach the `appProcessAtom` and subscribe to changes.
