import { connectAssets } from '@exodus/assets'
import assetsBase from '@exodus/assets-base'

import meta from '../meta.js'

const noTokens = Object.fromEntries(
  Object.entries(assetsBase).filter(([, asset]) => asset.baseAssetName === asset.name)
)

const connectedAssets = connectAssets({
  ...noTokens,
  token1: { baseAssetName: 'ethereum' },
  token2: { baseAssetName: 'ethereum' },
})

describe('Trezor meta', () => {
  test('should match snapshot', () => {
    const {
      isSegwit,
      isBip84,
      isSupportedByTrezor,
      isSupportedOnlyByModelT,
      isSupportedFirmware,
      ...staticProps
    } = meta(connectedAssets)
    expect(staticProps).toMatchSnapshot()
  })
})
