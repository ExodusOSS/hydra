import getIsBaseAssetWithChainIcon from '../../selectors/get-is-base-asset-with-chain-icon.js'

describe('isBaseAssetWithChainIcon', () => {
  const defaultAssets = {
    bitcoin: {
      name: 'bitcoin',
      baseAsset: { name: 'btc' },
    },
    dogecoin: {
      name: 'dogecoin',
      baseAsset: {
        name: 'dogecoin',
      },
      api: {
        getTokens: () => {},
      },
      baseAssetName: 'dogecoin',
    },
    shiba: {
      name: 'shiba',
      api: {
        hasFeature: (feature) => feature === 'customTokens',
      },
      baseAsset: { name: 'shiba' },
    },
    usdcoin_algorand: {
      name: 'usdcoin_algorand',
      baseAsset: { name: 'usdcoin' },
      baseAssetName: 'usdcoin',
    },
    weth: {
      name: 'weth',
      assetType: 'MULTI_NETWORK_ASSET',
      combinedAssetNames: ['weth_usdc', 'weth_usdc'],
      baseAsset: {
        name: 'weth',
      },
      baseAssetName: 'weth',
    },
  }

  const allAssetsSelector = () => defaultAssets
  const state = {}
  let isBaseAssetWithChainIconSelector

  beforeEach(() => {
    isBaseAssetWithChainIconSelector =
      getIsBaseAssetWithChainIcon.selectorFactory(allAssetsSelector)
  })

  test('should return false if baseAssetname is not equal to assetName', () => {
    const isBaseAssetWithChainIcon = isBaseAssetWithChainIconSelector(
      defaultAssets.usdcoin_algorand.name
    )(state)

    expect(isBaseAssetWithChainIcon).toBe(false)
  })

  test('should return true if asset has getTokens api', () => {
    const isBaseAssetWithChainIcon = isBaseAssetWithChainIconSelector(defaultAssets.dogecoin.name)(
      state
    )

    expect(isBaseAssetWithChainIcon).toBe(true)
  })

  test('should return true if asset has customTokens feature', () => {
    const isBaseAssetWithChainIcon = isBaseAssetWithChainIconSelector(defaultAssets.shiba.name)(
      state
    )

    expect(isBaseAssetWithChainIcon).toBe(true)
  })

  test('should return true if asset has assets on other chains', () => {
    const isBaseAssetWithChainIcon = isBaseAssetWithChainIconSelector(defaultAssets.weth.name)(
      state
    )

    expect(isBaseAssetWithChainIcon).toBe(true)
  })
})
