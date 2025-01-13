const resultFunction = (data) => data.byBaseAssetSource

const optimisticByBaseAssetSourceFieldSelector = {
  id: 'optimisticByBaseAssetSourceField',
  resultFunction,
  dependencies: [
    //
    { selector: 'optimisticData' },
  ],
}

export default optimisticByBaseAssetSourceFieldSelector
