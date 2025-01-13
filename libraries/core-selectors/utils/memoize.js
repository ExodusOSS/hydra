import lodash from 'lodash'
import assert from 'minimalistic-assert'

const { memoize } = lodash

const getKeyFromAssetSource = (assetSource) => {
  assert(!!assetSource, `missing assetSource`)
  assert(!!assetSource.walletAccount, `missing walletAccount`)
  assert(!!assetSource.assetName, `missing assetName`)

  return `${assetSource.walletAccount}_${assetSource.assetName}`
}

export const memoizeByAssetSource = (fn) => memoize(fn, getKeyFromAssetSource)

export default memoize // eslint-disable-line unicorn/prefer-export-from
