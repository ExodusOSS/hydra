import { createStorageAtomFactory, withSerialization } from '@exodus/atoms'
import { PersonalNoteSet } from '@exodus/models'

const createPersonalNotesAtom = ({ storage }) => {
  const atom = createStorageAtomFactory({ storage })({
    key: 'data',
    defaultValue: [],
    isSoleWriter: true,
  })

  const serialized = withSerialization({
    atom,
    serialize: (personalNotes) =>
      personalNotes === undefined ? undefined : personalNotes.toJSON(),
    deserialize: (personalNotesArray) => PersonalNoteSet.fromArray(personalNotesArray),
  })

  return {
    original: atom,
    atom: serialized,
  }
}

export default createPersonalNotesAtom
