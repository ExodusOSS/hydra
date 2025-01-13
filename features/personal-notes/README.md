# @exodus/personal-notes

## Usage

```js
import createPersonalNotes, { createPersonalNotesAtom } from '@exodus/personal-notes'

const personalNotesStorage = storage.namespace('personalNotes')
const personalNotesAtom = createPersonalNotesAtom({ storage: personalNotesStorage })

const personalNotes = createPersonalNotes({
  personalNotesAtom,
  fusion,
  // ... other dependencies
})

// somewhere from user input
personalNotes.upsert({ txId: 'some-tx-id', message: 'my personal note for tx' })
```
