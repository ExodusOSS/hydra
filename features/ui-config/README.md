# @exodus/ui-config

Helper for storing various UI-specific settings/config. Use this ONLY for UI-specific settings/config. Most data is NOT UI-specific and should be managed by domain-specific features/modules/atoms in the background.

Valid examples:

- Boolean flag that controls whether to show price maps in the UI
- Boolean flag that flips to true after onboarding was shown
- Counter for how many times a modal has been shown, or needs to be shown

## Usage

```js
import uiConfig from '@exodus/ui-config'

// exodus is created via `@exodus/headless`
exodus.use(
  uiConfig({
    config: [
      // Note: these are NOT atom definitions, they're only metadata about atoms: `id` and later `type` (so we can
      // internally instantiate different types of atoms)
      //
      // these are emitted to the `port` as events 'delightUser' and 'terrifyUser'
      { id: 'delightUser' },
      { id: 'terrifyUser' },
    ],
  })
)

// API usage
exodus.uiConfig.delightUser(true)
exodus.uiConfig.terrifyUser(false)
```

// Port events
feature emit data from atoms in with following format: `port.emit('delightUserAtom', value)`
