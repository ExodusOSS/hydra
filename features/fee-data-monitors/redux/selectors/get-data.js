export const _resultFunction = ({ feeData, asset }) => {
  const { baseAsset } = asset

  const data = feeData[baseAsset.name]

  if (!data) {
    console.warn(`${asset.name} (baseAssetName: ${baseAsset.name}) does not have feeData`)
  }

  return data
}

const resultFunction = (feeData, getAsset) => (assetName) => {
  const asset = getAsset(assetName)
  if (!asset) {
    console.warn(`"${assetName}" is not present in assets`)
    return
  }

  return _resultFunction({ feeData, asset })
}

const getDataSelectorDefinition = {
  id: 'getData',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
    { selector: 'getAsset', module: 'assets' },
  ],
}

export default getDataSelectorDefinition
