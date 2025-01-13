const meta = require('../meta')

const mockAssets = {
  bitcoin: { assetType: 'BITCOIN_LIKE' },
  ethereum: { assetType: 'ETHEREUM_LIKE' },
  token1: { assetType: 'ETHEREUM_ERC20' },
  token2: { assetType: 'ETHEREUM_ERC20' },
}

describe('Trezor meta', () => {
  test('should match snapshot', () => {
    const {
      isSegwit,
      isBip84,
      isSupportedByTrezor,
      isSupportedOnlyByModelT,
      isSupportedFirmware,
      ...staticProps
    } = meta(mockAssets)
    expect(staticProps).toMatchSnapshot()
  })
})
