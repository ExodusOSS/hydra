import { combine, compute, dedupe } from '@exodus/atoms'

const createEnabledAssetsAtom = ({ enabledAndDisabledAssetsAtom, availableAssetNamesAtom }) => {
  const selector = ({ enabledAndDisabled, availableAssetNames }) => {
    const availableSet = new Set(availableAssetNames)
    return Object.fromEntries(
      Object.keys(enabledAndDisabled.disabled)
        .filter((assetName) => {
          const disabled = enabledAndDisabled.disabled[assetName]
          return disabled === false && availableSet.has(assetName)
        })
        .map((assetName) => [assetName, true])
    )
  }

  const combined = combine({
    enabledAndDisabled: enabledAndDisabledAssetsAtom,
    availableAssetNames: availableAssetNamesAtom,
  })

  return dedupe(compute({ atom: combined, selector }))
}

export default createEnabledAssetsAtom
