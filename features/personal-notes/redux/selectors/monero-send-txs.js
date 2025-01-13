const resultFunction = (personalNotes) =>
  Object.fromEntries(
    personalNotes
      .toJSON()
      .filter((note) => note.xmrInputs)
      .map((note) => [
        note.txId,
        {
          txId: note.txId,
          inputs: note.xmrInputs,
        },
      ])
  )

const moneroSendTxsSelectorDefinition = {
  id: 'moneroSendTxs',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
  ],
}

export default moneroSendTxsSelectorDefinition
