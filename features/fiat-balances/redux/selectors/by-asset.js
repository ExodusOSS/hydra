import resultFunction from './helpers/by-asset-result-func'

const byAssetSelector = {
  id: 'byAsset',
  resultFunction,
  dependencies: [
    //
    { selector: 'byAssetSource' },
  ],
}

export default byAssetSelector
