# @exodus/personal-notes

The module allows users to create, manage, and store personal notes securely for transactions

## How it Works

1. Personal Notes Atom

The core functionality of the module is powered by the `personalNotesAtom`, which stores user-generated notes.
Each note has uniq id and bounded to txId.
Personal Notes stored using `PersonalNoteSet` and `PersonalNote` [models](https://github.com/ExodusOSS/hydra/blob/8ac3c1382e3d51923de4d73c43c32f92005ae351/libraries/models/src/personal-note-set/index.js#L9)

```js
const personalNotes = PersonalNoteSet.fromArray([
  { txId: 'bitcoin-tx-1', message: 'gift for friend' },
  { txId: 'ethereum-tx-1', message: 'gift from friend' },
])
personalNotesAtom.set(personalNotes)

const bitcoinTxPersonalNote = personalNotes.get('bitcoin-tx-1')
```

2. Module

The module does 2 things:

1. Sync personal notes to `fusion`
2. Provides `upsert` method to add personal notes
   Only following props are allowed:

```js
exodus.personalNotes.upsert({
  txId, // required
  message, // string
  // specific fields used by platforms features
  username,
  address,
  dapp,
  providerData,
  walletConnect,
  xmrInputs,
})
```

3. Plugin

Plugin subscribes to `personalNotesAtom` and emit its value to `port`

4. Redux module

Provides selectors to get personal notes

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

### Play with it

1. Open the playground https://exodus-hydra.pages.dev/
2. Run `exodus.personalNotes.upsert({txId: 'e7b8f55e3173aed308b8fbff11ee1fb96183e51f111ac415da9ae057c72ac8ca', message: 'my note'})` in the Dev Tools Console.
3. Run `selectors.personalNotes.data(store.getState())` in the Dev Tools Console. You should see stored personal notes
4. Run `selectors.personalNotes.get(store.getState())('e7b8f55e3173aed308b8fbff11ee1fb96183e51f111ac415da9ae057c72ac8ca')` in the Dev Tools Console. You should see specific personal note

### API Side

See [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK

```ts
exodus.personalNotes.upsert(<Event>{
  txId: 'bitcoin-tx-id',
  message: 'tx for friend',
})
```

### UI Side

See [using the sdk](../../docs/development/using-the-sdk.md#events) for more details on basic UI-side setup.

```js
import { selectors } from '~/ui/flux'

const usePersonalNote = (txId) => {
  const getPersonalNote = useSelector(selectors.personalNotes.get)
  const personalNote = getPersonalNote(txId)

  return personalNote
}
```
