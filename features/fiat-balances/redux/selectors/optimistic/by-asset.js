import resultFunction from '../helpers/by-asset-result-func'

const byAssetSelector = {
  id: 'optimisticByAsset',
  resultFunction,
  dependencies: [
    //
    { selector: 'optimisticByAssetSource' },
  ],
}

export default byAssetSelector
