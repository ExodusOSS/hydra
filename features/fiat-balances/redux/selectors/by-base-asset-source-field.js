const resultFunction = (data) => data.byBaseAssetSource

const byBaseAssetSourceFieldSelector = {
  id: 'byBaseAssetSourceField',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
  ],
}

export default byBaseAssetSourceFieldSelector
