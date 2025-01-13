export const _resultFunction = ({ feeData, assets, assetName }) => {
  if (!assets[assetName]) {
    console.warn(`${assetName} is not present in assets`)
    return
  }

  const { baseAsset } = assets[assetName]

  const data = feeData[baseAsset.name]

  if (!data) {
    console.warn(`${assetName} (baseAssetName: ${baseAsset.name}) does not have feeData`)
  }

  return data
}

const resultFunction = (feeData, assets) => (assetName) =>
  _resultFunction({ feeData, assets, assetName })

const getDataSelectorDefinition = {
  id: 'getData',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
    { selector: 'all', module: 'assets' },
  ],
}

export default getDataSelectorDefinition
