# @exodus/remote-config

This module provides simplified access to remote config values

## Install

```sh
yarn add @exodus/remote-config
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

### Play with it

1. Open the playground <https://exodus-hydra.pages.dev/features/remote-config>
2. Try out the some methods via the UI. These corresponds 1:1 with the `exodus.remoteConfig` API.
3. Run `await exodus.remoteConfig.get('assets.algorand.blockExplorer')` in the Dev Tools Console.

### API Side

See [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK and the API interface in the [type declaration](./api/index.ts).

```ts
const { addressUrl, txUrl } = await exodus.remoteConfig.get('core.wallet.sunsetAssets')

const config = await exodus.remoteConfig.getAll()
```

If you're building a feature that requires values from the remote config, you can use [remote-config-atoms](../../libraries/remote-config-atoms) to subscribe to slices of the remote config. The following example demonstrates how to use remote config atoms to create an atom that subscribes to the `core.exchange.preferSameNetworkUsdThreshold` value:

```ts
import { createRemoteConfigAtomFactory } from '@exodus/atoms'

// below definition can be shipped with a feature and depended on by other nodes by specifying 'sameNetworkUsdThresholdAtom' as dependency
const sameNetworkUsdThresholdAtom = {
  id: 'sameNetworkUsdThresholdAtom',
  factory({ remoteConfig }) {
    const createRemoteConfigAtom = createRemoteConfigAtomFactory({ remoteConfig })
    const atom = createRemoteConfigAtom({
      path: 'core.exchange.preferSameNetworkUsdThreshold',
      defaultValue: 42,
    })

    return atom
  },
  dependencies: ['remoteConfig'],
}
```

### UI Side

See [using the sdk](../../docs/development/using-the-sdk.md#events) for more details on basic UI-side setup.

```js
import { selectors } from '~/ui/flux'

const MyComponent = () => {
  const preferSameNetworkUsdThreshold = useSelector(
    selectors.remoteConfig.get('core.exchange.preferSameNetworkUsdThreshold')
  )
}
```
