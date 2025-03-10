# @exodus/restore-progress-tracker

This feature enables tracking of restore progress for individual assets. During the restore process, you can check if an asset has been restored or not.
Additionally, it prevents the application from switching to a restored state until all assets are successfully restored.

## How It Works

### 1. Feature Creation

The feature creates a `restoringAssetsAtom` storage atom that stores data in the form of a map:

```js
const restoringAssets = { bitcoin: false, ethereum: true }
```

This map keeps track of which assets are currently being restored.

### 2. Event Tracking and Subscription

During the module's initialization in the constructor, it sets up subscriptions to `txLogMonitors` to track specific events:

- `['after-tick-multiple-wallet-accounts', 'after-restore']`: These events are tracked by default but can be configured.
- `unknown-tokens`: This event is also tracked. (more on this below)

### 3. Restore Process Initiation

Once the headless application module starts the restore process, the `restore-progress-tracker` plugin calls the `restoreAll` function for the
`restore-progress-tracker` module. This marks all available assets as restoring.

### 4. Asset Restoration and Event Emission

After receiving events from `txLogMonitors` for specific assets, they are marked as restored. If an asset receives an `unknown-tokens` event before
that, it waits for a second monitor tick because newly added tokens need to run the monitor.

Once all assets have received their respective monitor events, the module emits a `restored` event and unblocks the promise in the plugin. This prevents
the `onRestore` application hook from being completed prematurely.

### 5. Additional Functionality

The feature allows you to mark individual assets as restored after the restore process is finished. This is particularly useful for monero on-demand
restores or EOS/HEDERA account resets.

## Usage

This feature is designed to be used together with `@exodus/headless`. For more details, see [using the SDK](../../docs/development/using-the-sdk.md).

### Play with it

1.  Open the playground at https://exodus-hydra.pages.dev/.
2.  Run the command `exodus.restoreProgressTracker.restoreAsset('bitcoin'); selectors.restoringAssets.data(store.getState())` in the Dev Tools Console to view the object map of restoring assets including bitcoin.

### API Side Configuration and Usage

For more details on how features plug into the SDK and A/B Testing Events, see [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side).

```typescript
// Mark an asset as being restored. The asset will be restored once the monitor ticks.
exodus.restoreProgressTracker.restoreAsset('eosio')
```

### Configurations

Two configurations are available:

- `config.monitorEvents`: By default, it listens to 2 monitor events: `after-tick-multiple-wallet-accounts`, and `after-restore`.
- `config.assetNamesToNotWait`: By default, it includes `['monero']`. This means that we don't wait for monero to be restored before marking the
  wallet as restored.

### UI Side Setup

See [using the SDK](../../docs/development/using-the-sdk.md#events) for more details on basic UI-side setup and the `useAssetRestoring` hook creation.

```typescript
import { selectors } from '~/ui/flux'

const useAssetRestoring = (assetName) => {
  return useSelector((state) => !!selectors.restoringAssets.data(state)[assetName])
}
```

This `useAssetRestoring` hook makes it easy to check if an asset is restored or not.
