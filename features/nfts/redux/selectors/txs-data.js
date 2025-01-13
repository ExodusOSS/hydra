const resultFunction = (txs) => txs.data

const txsDataSelectorDefinition = {
  id: 'txsData',
  resultFunction,
  dependencies: [
    //
    { selector: 'txs' },
  ],
}

export default txsDataSelectorDefinition
