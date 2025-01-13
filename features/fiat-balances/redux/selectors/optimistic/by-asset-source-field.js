const resultFunction = (data) => data.byAssetSource

const optimisticByAssetSourceFieldSelector = {
  id: 'optimisticByAssetSourceField',
  resultFunction,
  dependencies: [
    //
    { selector: 'optimisticData' },
  ],
}

export default optimisticByAssetSourceFieldSelector
