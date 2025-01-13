import { parseOrigin } from './utils.js'

const sortAlphabetically = (a, b) => {
  const originA = parseOrigin(a.origin)
  const originB = parseOrigin(b.origin)

  if (originA === originB) {
    return a.connectedAssetName.localeCompare(b.connectedAssetName)
  }

  return originA.localeCompare(originB)
}

const resultFunction = (data) =>
  data.filter((item) => item.trusted ?? true).sort(sortAlphabetically)

const trustedSelector = {
  id: 'trusted',
  resultFunction,
  dependencies: [{ selector: 'data' }],
}

export default trustedSelector
