// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

import type { Asset } from '../types.js'
import currencies from './_fixtures-currencies.js'

const { mapValues } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const _assets = mapValues(currencies, (currency, name) => {
  const basicAsset: Record<string, any> = { name, currency }
  basicAsset.feeAsset = basicAsset
  return basicAsset
})

_assets.tetherusdtron.feeAsset = _assets.tronmainnet

export const assets = _assets as Record<string, Asset>
