const resultFunction = (optimisticData) => optimisticData.totals.balance

const optimisticTotalBalanceSelector = {
  id: 'optimisticTotalBalance',
  resultFunction,
  dependencies: [
    //
    { selector: 'optimisticData' },
  ],
}

export default optimisticTotalBalanceSelector
