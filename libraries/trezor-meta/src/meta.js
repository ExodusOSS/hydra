const constants = require('./constants')
const coinUtil = require('./coin-util')

const uniq = (arr) => [...new Set(arr)]
const difference = (arr1, arr2) => {
  const set2 = new Set(arr2)
  return arr1.filter((x) => !set2.has(x))
}

const getTrezorMeta = (assets) => {
  const ERC20_TOKEN_NAMES = Object.keys(assets).filter(
    (assetName) => assets[assetName].assetType === 'ETHEREUM_ERC20'
  )

  // Assets supported by all trezor models on Exodus
  const BASE_SUPPORTED_ASSETS = [
    'bitcoin',
    'ethereum',
    'dogecoin',
    'litecoin',
    'bcash',
    'ethereumclassic',
    'zcash',
    'stellar',
    ...ERC20_TOKEN_NAMES,
  ].sort()

  // Trezor Safe 3 has deprecated support for some assets
  const BASE_SUPPORTED_TREZOR_ONE_AND_T = [...BASE_SUPPORTED_ASSETS, 'dash', 'decred', 'digibyte']

  // Assets supported by specific Trezor models on Exodus.
  const ASSETS_BY_MODEL = {
    'Safe 5': [...BASE_SUPPORTED_ASSETS, 'cardano', 'ripple'].sort(),
    'Safe 3': [...BASE_SUPPORTED_ASSETS, 'cardano', 'ripple'].sort(),
    T: [...BASE_SUPPORTED_TREZOR_ONE_AND_T, 'cardano', 'ripple'].sort(),
    1: [...BASE_SUPPORTED_TREZOR_ONE_AND_T],
  }

  // An object of asset names sorted by the device model which supports them.
  // Indicates assets supported on the firmware, but not necessarily
  // supported by our trezor integration yet
  const FIRMWARE_ASSETS_BY_MODEL = {
    'Safe 5': [...constants.ASSETS_BY_MODEL['Safe 5'], ...ERC20_TOKEN_NAMES],
    'Safe 3': [...constants.ASSETS_BY_MODEL['Safe 3'], ...ERC20_TOKEN_NAMES],
    T: [...constants.ASSETS_BY_MODEL.T, ...ERC20_TOKEN_NAMES],
    1: [...constants.ASSETS_BY_MODEL['1'], ...ERC20_TOKEN_NAMES],
  }

  // Assets supported by Trezor but may differ between models.
  const SUPPORTED_ASSETS = uniq(Object.values(ASSETS_BY_MODEL).flat()).sort()

  // Assets supported exclusively on model T.
  const SUPPORTED_ONLY_BY_MODEL_T = difference(ASSETS_BY_MODEL.T, ASSETS_BY_MODEL['1'])

  // Assets we are planning to support in future.
  const FUTURE_SUPPORTED_ASSETS = ['tezos', 'ravencoin']

  const isSegwit = (assetName) =>
    assets[assetName].assetType !== 'ETHEREUM_ERC20' && coinUtil.isSegwit(assetName)

  // eslint-disable-next-line @exodus/hydra/no-asset-conditions
  const isBip84 = (assetName) => ['bitcoin', 'litecoin'].includes(assetName)

  const isSupportedByTrezor = (assetName) => SUPPORTED_ASSETS.includes(assetName)

  // Assets supported exclusively on model T.
  const isSupportedOnlyByModelT = (assetName) => SUPPORTED_ONLY_BY_MODEL_T.includes(assetName)

  return {
    isSupportedFirmware: constants.isSupportedFirmware,
    SUPPORTED_MODELS: constants.SUPPORTED_MODELS,
    BASE_SUPPORTED_ASSETS,
    ASSETS_BY_MODEL,
    FIRMWARE_ASSETS_BY_MODEL,
    SUPPORTED_ASSETS,
    SUPPORTED_ONLY_BY_MODEL_T,
    FUTURE_SUPPORTED_ASSETS,
    isSegwit,
    isBip84,
    isSupportedByTrezor,
    isSupportedOnlyByModelT,
  }
}

module.exports = getTrezorMeta
