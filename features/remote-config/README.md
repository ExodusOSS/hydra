# @exodus/remote-config

Module to provide simplified access to remote config values

## Usage

```ts
import createRemoteConfig from '@exodus/remote-config'

const config = createRemoteConfig({
  eventEmitter: new EventEmitter(),
  freeze: proxyFreeze,
  fetch,
  logger: createLogger('exodus:remote-config'),
  config: {
    remoteConfigUrl: 'https://wayne-foundation.com/v1/exodus.json',
    fetchInterval: ms('2m'), // optional
    errorBackoffTime: ms('5s'), // optional
  },
})

// to start polling, invoke `load` on the config instance. Do not await the result.
config.load()
```

### Events

Config changes can be subscribed to by registering listeners. Use the `on` or `once` function to do so.
The following events are available:

| event             | description                                                                                                                                                                         | params                                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 'sync'            | Triggered when the config is initially loaded from its definitions and on every subsequent update propagated either through a definitions onChange handler or when setting a value. | Receives an object with the properties `current` containing the current config and `previous` containing the config before the change was applied           |
| \`update:${key}\` | (local config only) Triggered when the value for `key` was updated.                                                                                                                 | Receives an object with the properties `current` containing the current value for the key and `previous` containing the value before the change was applied |

The following line shows how to listen for changes to the `lastSeen` key:

```ts
config.on('update:lastSeen', ({ current, previous }) => {
  console.log(`Last seen changed to ${current.toUTCString()}. Was ${previous.toUTCString()} before`)
})
```

If you're interested in the whole config instead, consider using the following

```ts
config.on('sync', ({ current, previous }) => {
  // do things
})
```

Please note that both events are fired after the initial load of the config completes. The update event will
trigger once for every key defined in the key definitions.
