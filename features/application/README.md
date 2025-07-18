# @exodus/application

The `application` package represents the high-level application that
uses the Exodus SDK.

## Table of Contents

- [How it works](#how-it-works)
- [Usage](#usage)
- [Lifecycle Hooks](#lifecycle-hooks)
  - [Available hooks](#available-hooks)
  - [Visual representation](#visual-representation)

## How it works

It orchestrates the creation, importation, deletion, and restoration
of wallets, handles security aspects like locking and passphrase
management, and provides a flexible hook system for other components
to respond to lifecycle events.

## Usage

This feature is available as part of `@exodus/headless`, there is no
need to install it separately.

For examples on using this feature in both the API and UI side,
please refer to the related [SDK playground page](https://exodus-hydra.pages.dev/features/application).

### Lifecycle Hooks

While using the Exodus SDK, the application can subscribe to several
lifecycle hooks, which are triggered in `application` package.

Hooks subscriptions are handled by registering a `plugin` node
against the IoC container. The plugin can export several different
hooks, which are invoked when the corresponding lifecycle event happens.

For instance, if you want to run some code when the application is
started, you can create a plugin like this:

```typescript
const plugin = () => {
  const onStart = ({ isBackedUp }) => {
    // Run some code when the application starts
  }

  return {
    onStart,
  }
}

const myPluginDefinition = {
  id: 'myPlugin', // unique id
  type: 'plugin', // type of the node
  factory: plugin, // factory function
}
```

### Available hooks

Some hooks receive parameters, if so, they are documented below.

- `onStart`: Triggered when the application starts. Called with `{ walletExists, hasPassphraseSet, isLocked, isBackedUp, isRestoring }`.
- `onRestart`: Triggered when the application restarts. Called with `{ reason }` and other parameters (varies depending on the reason).
- `onStop`: Triggered when the application stops.
- `onLoad`: Do NOT use this hook. Its sole purpose is a hack to support the browser extension, where the UI might die and be recreated while the background process is long-lived. In that scenario, `onLoad` is triggered when a new UI is recreated and connects to the background process. Called with the same parameters as `onStart`.
- `onUnload`: Triggered when the application is unloaded, i.e.,
  the app is closed.
- `onCreate`: Triggered when a new wallet is created. Called with `{ walletExists, hasPassphraseSet, isLocked, isBackedUp, isRestoring, seedId }`.
- `onImport`: Triggered when a wallet is imported. Called with `{ seedId, compatibilityMode, backupType }`.
- `onDelete`: Triggered when a wallet is deleted.
- `onRestore`: Triggered when a wallet (primary seed) restore process starts. Called with `{ backupType }`.
- `onRestoreCompleted`: Triggered when a wallet seed restore process completes. Called with `{ backupType }`.
- `onAddSeed`: Triggered when a new extra seed is added to the wallet. Called with `{ seedId, compatibilityMode }`.
- `onRestoreSeed`: Triggered when a seed restore process starts. Called with `{ seedId, compatibilityMode }`.
- `onAssetsSynced`: Triggered when the assets are synced.
- `onChangePassphrase`: Triggered when the passphrase is changed.
- `onLock`: Triggered when the application is locked.
- `onUnlock`: Triggered when the application is unlocked.
- `onClear`: Triggered when the application is cleared, i.e.,
  after the current wallet is deleted. Hook functions are executed concurrently.

### Visual representation

Below you can find a state diagram that visualize what hooks are triggered between state transitions:

```mermaid
stateDiagram-v2
    direction LR
    [*] --> Starting

    state Starting {
        direction LR

        state "Needs clear storage?*" as NeedsClear
        state "Is importing?" as IsImporting

        NeedsClear --> Clearing : CLEAR
        Clearing --> IsImporting
        IsImporting --> Importing : IMPORT
    }

    Starting --> Started : START

    state Started {
        direction LR

        state "Has seed?" as HasSeed

        HasSeed --> Empty : No
        HasSeed --> Locked : Yes

        Empty --> Locked : CREATE \n---or---\nIMPORT

        Locked --> Migrating : MIGRATE
        Migrating --> Unlocked : UNLOCK
        Unlocked --> Locked : LOCK

        Unlocked --> Restarting : DELETE


    }

    Restarting --> [*] : RESTART

    Started --> Started : LOAD

    classDef conditional fill:#ededed,stroke:#c2c2c2,color:#a6a6a6,stroke-width:2;

    class NeedsClear conditional
    class IsImporting conditional
    class HasSeed conditional
```

\* Wallet needs to clear storage if seed is not present or is restoring a new wallet
