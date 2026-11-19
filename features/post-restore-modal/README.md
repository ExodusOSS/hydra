# @exodus/post-restore-modal

This feature encapsulates logic to determine whether a user receives any balance after the restore process is complete.

## How It Works

1.  The feature creates a storage atom called `shouldShowPostRestoredModalAtom`, which stores a boolean value indicating whether the post-restore modal
    should be displayed.
2.  Once the restore process finishes, it checks if the user has any balance and sets the `shouldShowPostRestoredModalAtom` to `true`.

## Usage

This feature is designed for use with `@exodus/headless`. For more information on how features integrate with the SDK, see [Using the
SDK](../../docs/development/using-the-sdk.md).

### Play with it

1.  Open the playground at https://exodus-hydra.pages.dev/.
2.  Run the command `selectors.postRestoreModal.shouldShowRestoredModal(store.getState())` in the Dev Tools Console to view the current state of the
    post-restore modal.
3.  You should see a value of `false`, indicating that you have balance after restore.
4.  To clear the value and restart the logic, run `exodus.postRestoreModal.clear()`.
5.  Run `exodus.application.import({ mnemonic, passphrase })` with mnemonic phrase that contains balance
6.  Run `exodus.application.unlock({ passphrase })`
7.  After some time when restore finishes run `selectors.postRestoreModal.shouldShowRestoredModal(store.getState())` to see `true` meaning you have balance and restore finished/

### API Side Setup

For more details on how features integrate with the SDK and the API interface, see [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side)

```typescript
exodus.postRestoreModal.clear() // To clear the value in storage so that the logic re-runs on next restore.
```

### UI Side Setup

For more details on basic UI-side setup, see [using the sdk](../../docs/development/using-the-sdk.md#events).

```typescript
const showRestoreModal = useSelector(selectors.postRestoreModal.shouldShowRestoredModal)
```

This `showRestoreModal` variable can be used in your UI code to determine whether to display the post-restore modal.
