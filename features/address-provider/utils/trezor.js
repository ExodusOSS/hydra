import lodash from 'lodash'
import { createMeta } from '@exodus/trezor-meta'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

export const getTrezorMeta = memoize(
  (asset) =>
    createMeta({
      [asset.name]: asset,
    }),
  (asset) => asset.name
)
