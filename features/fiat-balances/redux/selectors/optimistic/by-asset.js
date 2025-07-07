import resultFunction from '../helpers/by-asset-result-func.js'

const byAssetSelector = {
  id: 'optimisticByAsset',
  resultFunction,
  dependencies: [
    //
    { selector: 'optimisticByAssetSource' },
  ],
}

export default byAssetSelector
