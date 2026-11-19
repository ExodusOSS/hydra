import * as constants from './constants.js'
import * as compatibilityUtils from './compatibility-utils.js'

const uniq = (arr) => [...new Set(arr)]
const difference = (arr1, arr2) => {
  const set2 = new Set(arr2)
  return arr1.filter((x) => !set2.has(x))
}

const { MODEL_1, MODEL_T, MODEL_SAFE_3, MODEL_SAFE_5, MODEL_SAFE_7 } = compatibilityUtils

const getTrezorMeta = (assets) => {
  const getNamesSupportingAllModels = (...models) => {
    return Object.entries(assets)
      .filter(
        ([, asset]) =>
          models.filter((model) => compatibilityUtils.isTrezorSupported({ asset, model }))
            .length === models.length
      )
      .map(([name]) => name)
      .sort()
  }

  // Assets supported by all trezor models on Exodus
  // NOTE, it's only used on desktop, it can be removed once migrated to compatibility utils
  const BASE_SUPPORTED_ASSETS = getNamesSupportingAllModels(MODEL_1, MODEL_SAFE_3)

  // Assets supported by specific Trezor models on Exodus.
  const ASSETS_BY_MODEL = {
    'Safe 7': getNamesSupportingAllModels(MODEL_SAFE_7),
    'Safe 5': getNamesSupportingAllModels(MODEL_SAFE_5),
    'Safe 3': getNamesSupportingAllModels(MODEL_SAFE_3),
    T: getNamesSupportingAllModels(MODEL_T),
    1: getNamesSupportingAllModels(MODEL_1),
  }

  // Assets supported by Trezor but may differ between models.
  const SUPPORTED_ASSETS = uniq(Object.values(ASSETS_BY_MODEL).flat()).sort()

  // Assets supported exclusively on model T.
  const SUPPORTED_ONLY_BY_MODEL_T = difference(ASSETS_BY_MODEL.T, ASSETS_BY_MODEL['1'])

  // Assets we are planning to support in future.
  const FUTURE_SUPPORTED_ASSETS = Object.entries(compatibilityUtils.supportedNetworks)
    .filter(([, config]) => config.futureSupport)
    .map(([network]) => network)
    .sort()

  const isSegwit = (assetName) =>
    compatibilityUtils.getTrezorConfiguration({ asset: assets[assetName] }).isSegwit

  const isBip84 = (assetName) =>
    compatibilityUtils.getTrezorConfiguration({ asset: assets[assetName] }).isBip84

  const isSupportedByTrezor = (assetName) =>
    compatibilityUtils.isTrezorSupported({ asset: assets[assetName] })

  // Assets supported exclusively on model T.
  const isSupportedOnlyByModelT = (assetName) => SUPPORTED_ONLY_BY_MODEL_T.includes(assetName)

  return {
    isSupportedFirmware: constants.isSupportedFirmware,
    SUPPORTED_MODELS: constants.SUPPORTED_MODELS,
    BASE_SUPPORTED_ASSETS,
    ASSETS_BY_MODEL,
    SUPPORTED_ASSETS,
    SUPPORTED_ONLY_BY_MODEL_T,
    FUTURE_SUPPORTED_ASSETS,
    isSegwit,
    isBip84,
    isSupportedByTrezor,
    isSupportedOnlyByModelT,
  }
}

export default getTrezorMeta
