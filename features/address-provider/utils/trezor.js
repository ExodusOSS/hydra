// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createMeta } from '@exodus/trezor-meta'

const { memoize } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils

export const getTrezorMeta = memoize(
  (asset) =>
    createMeta({
      [asset.name]: asset,
    }),
  (asset) => asset.name
)
