import lodash from 'lodash'
import { createMeta } from '@exodus/trezor-meta'

// eslint-disable-next-line @exodus/basic-utils/prefer-basic-utils
export const getTrezorMeta = lodash.memoize(
  (asset) =>
    createMeta({
      [asset.name]: asset,
    }),
  (asset) => asset.name
)
