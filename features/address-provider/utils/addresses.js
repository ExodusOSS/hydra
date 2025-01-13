import typeforce from '@exodus/typeforce'
import { getTrezorMeta } from './trezor.js'
import assert from 'minimalistic-assert'

const typeforceParams = (opts) => {
  typeforce(
    {
      asset: 'Object',
    },
    opts,
    false // may have more info
  )
}

// the first one on the list is the default purpose!
// @deprecated
// use asset-sources utils instead
export const getSupportedPurposes = (opts) => {
  typeforceParams(opts)

  const {
    asset,
    walletAccount: { compatibilityMode, isMultisig },
  } = opts
  const baseAsset = asset.baseAsset

  const apiExists = !!baseAsset.api?.getSupportedPurposes

  assert(
    !isMultisig || apiExists,
    'baseAsset must have api.getSupportedPurposes for a multisig WalletAccount'
  )

  if (apiExists) {
    // we seem to be having two different APIs for getSupportedPurposes, one that expects compatibilityMode separately, and one that expects it on walletAccount
    const supportedPurposes = baseAsset.api?.getSupportedPurposes({
      ...opts,
      compatibilityMode,
      isMultisig,
    })
    assert(supportedPurposes?.length, 'at least one purpose must be supported')
    return supportedPurposes
  }

  // the given asset should know what's the best value depending on the wallet account type and the compatibility mode.
  // everything below here to be removed

  if (compatibilityMode === 'trezor') {
    const trezorMeta = getTrezorMeta(baseAsset)
    return [
      baseAsset.useBip84 && trezorMeta.isBip84(asset.name) && 84, // segwit
      trezorMeta.isSegwit(asset.name) ? 49 : 44, // nested segwit
    ].filter(Boolean)
  }

  return [
    baseAsset.useBip49 === true && 49, // nested segwit
    baseAsset.useBip84 === true && 84, // segwit
    44, // legacy
    baseAsset.useBip86 === true && 86, // taproot
  ].filter(Boolean)
}

export const getDefaultPurpose = (opts) => {
  return getSupportedPurposes(opts)[0]
}
