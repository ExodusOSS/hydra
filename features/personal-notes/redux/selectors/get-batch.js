import lodash from 'lodash'

const { get, memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

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
