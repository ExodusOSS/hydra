import { get, memoize } from 'lodash' // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file

const resultFunction = (personalNotes) =>
  memoize((batchId) => {
    if (!batchId) return

    const personalNote = [...personalNotes].find((note) => get(note, 'dapp.batch.id') === batchId)

    return get(personalNote, 'dapp.batch')
  })

const getBatchSelectorDefinition = {
  id: 'getBatch',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
  ],
}

export default getBatchSelectorDefinition
