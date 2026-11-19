// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

const { get, memoize } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils

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
