const resultFunction = (optimisticData) => optimisticData.byWalletAccount

const optimisticByWalletAccountFieldSelector = {
  id: 'optimisticByWalletAccountField',
  resultFunction,
  dependencies: [
    //
    { selector: 'optimisticData' },
  ],
}

export default optimisticByWalletAccountFieldSelector
