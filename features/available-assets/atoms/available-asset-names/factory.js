import { compute } from '@exodus/atoms'

import selector from './selector.js'

// every atom get returns a fresh proxy, so deep-comparing inputs walks thousands of proxied
// objects per read; comparing the derived flat name list is cheap and keeps the reference stable
const memoizeNames = () => {
  let lastNames
  return (availableAssets) => {
    const names = selector(availableAssets)
    const isUnchanged =
      lastNames &&
      names.length === lastNames.length &&
      names.every((name, index) => name === lastNames[index])

    if (!isUnchanged) lastNames = names

    return lastNames
  }
}

const createAvailableAssetNamesAtom = ({ availableAssetsAtom }) =>
  compute({
    atom: availableAssetsAtom,
    selector: memoizeNames(),
  })

export default createAvailableAssetNamesAtom
