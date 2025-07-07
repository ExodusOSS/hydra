import { PersonalNoteSet } from '@exodus/models'
import createStorage from '@exodus/storage-memory'

import createPersonalNotesAtom from '../personal-notes.js'

describe('personalNotesAtom', () => {
  it('returns deserialized personal note', async () => {
    const { atom } = createPersonalNotesAtom({ storage: createStorage() })
    expect(await atom.get()).toEqual(PersonalNoteSet.EMPTY)
  })

  it('returns sets personal note', async () => {
    const { atom } = createPersonalNotesAtom({ storage: createStorage() })
    const notes = PersonalNoteSet.fromArray([
      { txId: '1', message: '2' },
      { txId: '3', message: '4' },
    ])
    await atom.set(notes)
    expect(await atom.get()).toEqual(notes)
  })
})
