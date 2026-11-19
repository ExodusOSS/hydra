import { gte } from 'semver'
import coins from './data/coins.js'

/**
 * The minimum firmware versions supported by this library.
 */
const MINIMUM_FIRMWARE_VERSIONS = { 'Safe 5': '2.7.2', 'Safe 3': '2.7.2', T: '2.7.2', 1: '1.13.0' }

/**
 * The latest available firmware versions known to this library.
 */
const LATEST_FIRMWARE_VERSIONS = { 'Safe 5': '2.8.7', 'Safe 3': '2.8.7', T: '2.8.8', 1: '1.13.0' }

/**
 * Export all asset data on a per-model basis as used by this library.
 * @returns {object}
 */
const ASSETS_BY_MODEL = {
  'Safe 5': coins
    .filter(
      (coin) =>
        coin.support.trezor3 && gte(MINIMUM_FIRMWARE_VERSIONS['Safe 5'], coin.support.trezor3)
    )
    .map((coin) => coin.exodus_name),
  'Safe 3': coins
    .filter(
      (coin) =>
        coin.support.trezor3 && gte(MINIMUM_FIRMWARE_VERSIONS['Safe 3'], coin.support.trezor3)
    )
    .map((coin) => coin.exodus_name),
  T: coins
    .filter(
      (coin) => coin.support.trezor2 && gte(MINIMUM_FIRMWARE_VERSIONS['T'], coin.support.trezor2)
    )
    .map((coin) => coin.exodus_name),
  1: coins
    .filter(
      (coin) => coin.support.trezor1 && gte(MINIMUM_FIRMWARE_VERSIONS['1'], coin.support.trezor1)
    )
    .map((coin) => coin.exodus_name),
}

/**
 * Helper function to check if the firmware is supported.
 */
const isSupportedFirmware = ({
  model,
  major_version: major,
  minor_version: minor,
  patch_version: patch,
}) => gte([major, minor, patch].join('.'), MINIMUM_FIRMWARE_VERSIONS[model])

/**
 * List of all the support models.
 */
const SUPPORTED_MODELS = ['Safe 5', 'Safe 3', 'T', '1']
/**
 * Helper function to check if the model is supported.
 */
const isSupportedModel = (model) => SUPPORTED_MODELS.includes(model)

/**
 * Get the available assets known to trezor.
 * @returns {Array} An array of asset names (exodus format).
 */
const assets = coins.map((coin) => coin.exodus_name)

export {
  assets,
  MINIMUM_FIRMWARE_VERSIONS,
  LATEST_FIRMWARE_VERSIONS,
  ASSETS_BY_MODEL,
  SUPPORTED_MODELS,
  isSupportedModel,
  isSupportedFirmware,
}
