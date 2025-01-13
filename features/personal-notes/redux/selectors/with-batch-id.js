import { get } from 'lodash'
import { PersonalNoteSet } from '@exodus/models'

const resultFunction = (personalNotes) =>
  PersonalNoteSet.fromArray(
    [...personalNotes].filter((personalNote) => get(personalNote, 'dapp.batch.id'))
  )

const withBatchIdSelectorDefinition = {
  id: 'withBatchId',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
  ],
}

export default withBatchIdSelectorDefinition
