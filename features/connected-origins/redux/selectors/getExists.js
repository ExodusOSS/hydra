const resultFunction = (trusted) => (assetName) => {
  if (!assetName) return trusted.length > 0

  return trusted.some(
    (site) => site.assetName === assetName || site.assetNames?.includes(assetName)
  )
}

const getExistsSelector = {
  id: 'getExists',
  resultFunction,
  dependencies: [{ selector: 'trusted' }],
}

export default getExistsSelector
