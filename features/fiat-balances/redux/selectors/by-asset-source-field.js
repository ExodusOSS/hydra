const resultFunction = (data) => data.byAssetSource

const byAssetSourceField = {
  id: 'byAssetSourceField',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
  ],
}

export default byAssetSourceField
