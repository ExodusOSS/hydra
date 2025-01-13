import currencies from './_fixtures-currencies.js'
import lodash from 'lodash'

const { mapValues } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const _assets = mapValues(currencies, (currency, name) => {
  const basicAsset = { name, currency }
  basicAsset.feeAsset = basicAsset
  return basicAsset
})

_assets.tetherusdtron.feeAsset = _assets.tronmainnet

export const assets = _assets
