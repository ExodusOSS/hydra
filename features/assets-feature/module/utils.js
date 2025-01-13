import { CT_STATUS as STATUS } from '@exodus/assets'
import lodash from 'lodash'
import assert from 'minimalistic-assert'

const { get } = lodash

const BLACKLISTED_ERRORS = [/Cannot destructure property 'owner'/u]

export const getAssetFromAssetId = (assets, assetId, baseAssetName) => {
  assert(assetId, 'getAssetFromAssetId(): assetId is required')
  assert(baseAssetName, 'getAssetFromAssetId(): baseAssetName is required')
  // ignore letter-case for assets that support checksummed addresses
  assetId = assetId.toLowerCase()
  return Object.values(assets).find(
    (asset) => assetId === asset.assetId?.toLowerCase() && baseAssetName === asset.baseAsset.name
  )
}

export const isDisabledCustomToken = (asset) =>
  asset.isCustomToken && asset.lifecycleStatus === STATUS.DISABLED

export async function getFetchErrorMessage(error) {
  const defaultExtraMessage = [
    error.message || 'Unknown',
    error.response?.status,
    error.response?.statusText,
  ]
    .filter(Boolean)
    .join(' - ')

  try {
    // Note. I'm not returning responseBody directly because it could be a large error (html) response when the server is down.
    const responseBody = await error.response?.text?.()

    if (!responseBody) return defaultExtraMessage

    const message = get(JSON.parse(responseBody), 'message')
    const isBlacklisted = BLACKLISTED_ERRORS.some((v) => v.test(message))

    if (isBlacklisted) return 'Could not fetch token'

    return message || defaultExtraMessage
  } catch {
    return defaultExtraMessage
  }
}
