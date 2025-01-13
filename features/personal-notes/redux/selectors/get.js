const resultFunction = (personalNotes) => (txId) => (txId ? personalNotes.get(txId) : null)

const getSelectorDefinition = {
  id: 'get',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
  ],
}

export default getSelectorDefinition
