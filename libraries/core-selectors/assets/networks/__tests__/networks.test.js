import lodash from 'lodash'

import assets from '../../../__tests__/assets.js'
import createParentCombinedNetworkAssetsSelector, {
  createCombinedNetworkChildrenAssetsSelector,
  createCreateCombinedAssetChildrenNamesSelector,
  createEnabledWithParentCombinedNetworkAssetNamesSelector,
  createGetCombinedAssetFallbackSelector,
  createGetHasAssetsOnOtherChainsSelector,
  createGetParentCombinedAssetSelector,
  createNetworksByAssetSelector,
  createWithoutCombinedNetworkAssetsSelector,
  createWithoutParentCombinedNetworkAssetsSelector,
  createWithParentCombinedNetworkAssetsSelector,
} from '../index.js'

const { keyBy, mapValues } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

describe('networks selectors', () => {
  const allAssetsSelector = () => {
    return {
      bitcoin: assets.bitcoin,
      ethereum: assets.ethereum,
      _usdcoin: assets._usdcoin,
      ...keyBy(assets._usdcoin.combinedAssets, 'name'),
    }
  }

  const combinedWithinUsdcoin = assets._usdcoin.combinedAssets.map((asset) => asset.name)
  const state = {}

  test('allAssetsWithinCombinedSelector', () => {
    const result = createCombinedNetworkChildrenAssetsSelector({ allAssetsSelector })(state)
    expect(result.map((asset) => asset.name)).toEqual(combinedWithinUsdcoin)
  })

  test('allAssetsWithoutCombinedWrappersSelector', () => {
    const result = createWithoutParentCombinedNetworkAssetsSelector({ allAssetsSelector })(state)
    expect(result.map((asset) => asset.name)).toEqual([
      'bitcoin',
      'ethereum',
      ...combinedWithinUsdcoin,
    ])
  })

  test('allAssetsWithoutCombinedSelector', () => {
    const result = createWithoutCombinedNetworkAssetsSelector({ allAssetsSelector })(state)
    expect(result.map((asset) => asset.name)).toEqual(['bitcoin', 'ethereum'])
  })

  test('assetsWithCombinedSelector', () => {
    expect(
      createWithParentCombinedNetworkAssetsSelector({ allAssetsSelector })(state).map(
        (asset) => asset.name
      )
    ).toEqual(['bitcoin', 'ethereum', '_usdcoin'])
  })

  test('enabledAssetNamesWithCombinedSelector returns single non-combined asset if only 1 of combined assets enabled', () => {
    const enabledAssetsSelector = () => {
      return {
        ethereum: true,
        bitcoin: true,
        usdcoin_algorand: false,
        usdcoin_solana: true,
      }
    }

    expect(
      createEnabledWithParentCombinedNetworkAssetNamesSelector({
        allAssetsSelector,
        enabledAssetsSelector,
      })(state)
    ).toEqual(['usdcoin_solana', 'bitcoin', 'ethereum'])
  })

  test('enabledAssetNamesWithCombinedSelector returns combined asset if only >1 combined assets enabled', () => {
    const enabledAssetsSelector = () => {
      return {
        ethereum: true,
        bitcoin: true,
        usdcoin_algorand: true,
        usdcoin_solana: true,
        usdcoin_tronmainnet: true,
      }
    }

    expect(
      createEnabledWithParentCombinedNetworkAssetNamesSelector({
        allAssetsSelector,
        enabledAssetsSelector,
      })(state)
    ).toEqual(['_usdcoin', 'bitcoin', 'ethereum'])
  })

  test('networksByAssetSelector', () => {
    const usdcoinNetworks = [
      {
        assetName: 'usdcoin',
        name: 'ethereum',
        primary: true,
      },
      {
        assetName: 'usdcoin_algorand',
        name: 'algorand',
        primary: false,
      },
      {
        assetName: 'usdcoin_solana',
        name: 'solana',
        primary: false,
      },
      {
        assetName: 'usdcoin_bsc',
        name: 'bsc',
        primary: false,
      },
      {
        assetName: 'usdcoin_tron',
        name: 'tronmainnet',
        primary: false,
      },
      {
        assetName: 'usdc_matic_0a883d9b',
        name: 'matic',
        primary: false,
      },
      {
        assetName: 'usdc_avalanchec_185c8bd7',
        name: 'avalanchec',
        primary: false,
      },
      {
        assetName: 'usdc_ethereumarbone_2e1129c4',
        name: 'ethereumarbone',
        primary: false,
      },
      {
        assetName: 'usdc_optimism_68bb70cd',
        name: 'optimism',
        primary: false,
      },
      {
        assetName: 'usdc_basemainnet_b5a52617',
        name: 'basemainnet',
        primary: false,
      },
    ]
    const result = createNetworksByAssetSelector({ allAssetsSelector })(state)
    expect(result).toEqual({
      usdcoin: usdcoinNetworks,
      usdcoin_algorand: usdcoinNetworks,
      usdcoin_bsc: usdcoinNetworks,
      usdcoin_tron: usdcoinNetworks,
      usdcoin_solana: usdcoinNetworks,
      usdc_avalanchec_185c8bd7: usdcoinNetworks,
      usdc_ethereumarbone_2e1129c4: usdcoinNetworks,
      usdc_matic_0a883d9b: usdcoinNetworks,
      usdc_optimism_68bb70cd: usdcoinNetworks,
      usdc_basemainnet_b5a52617: usdcoinNetworks,
    })
  })

  test('networksByAssetSelector with available networks', () => {
    const allAssetsSelectorWithAvailable = () => {
      const combinedAssets = mapValues(keyBy(assets._usdcoin.combinedAssets, 'name'), (asset) => {
        if (asset.name === 'usdcoin_solana') return { ...asset, available: false }

        return {
          ...asset,
          available: true,
        }
      })

      const _usdcoin = {
        ...assets._usdcoin,
        combinedAssets: Object.values(assets._usdcoin.combinedAssets).map((asset) => ({
          ...asset,
          baseAsset: asset.baseAsset,
          available: asset.name !== 'usdcoin_solana',
        })),
      }

      return {
        bitcoin: assets.bitcoin,
        ethereum: assets.ethereum,
        _usdcoin,
        ...combinedAssets,
      }
    }

    const usdcoinNetworks = [
      {
        assetName: 'usdcoin',
        name: 'ethereum',
        primary: true,
        available: true,
      },
      {
        assetName: 'usdcoin_algorand',
        name: 'algorand',
        primary: false,
        available: true,
      },
      {
        assetName: 'usdcoin_solana',
        name: 'solana',
        primary: false,
        available: false,
      },
      {
        assetName: 'usdcoin_bsc',
        name: 'bsc',
        primary: false,
        available: true,
      },
      {
        assetName: 'usdcoin_tron',
        name: 'tronmainnet',
        primary: false,
        available: true,
      },
      {
        assetName: 'usdc_matic_0a883d9b',
        available: true,
        primary: false,
        name: 'matic',
      },
      {
        assetName: 'usdc_avalanchec_185c8bd7',
        name: 'avalanchec',
        primary: false,
        available: true,
      },
      {
        assetName: 'usdc_ethereumarbone_2e1129c4',
        name: 'ethereumarbone',
        primary: false,
        available: true,
      },
      {
        assetName: 'usdc_optimism_68bb70cd',
        name: 'optimism',
        primary: false,
        available: true,
      },
      {
        assetName: 'usdc_basemainnet_b5a52617',
        name: 'basemainnet',
        primary: false,
        available: true,
      },
    ]

    const result = createNetworksByAssetSelector({
      allAssetsSelector: allAssetsSelectorWithAvailable,
    })(state)
    expect(result).toEqual({
      usdcoin: usdcoinNetworks,
      usdcoin_algorand: usdcoinNetworks,
      usdcoin_bsc: usdcoinNetworks,
      usdcoin_tron: usdcoinNetworks,
      usdcoin_solana: usdcoinNetworks,
      usdc_avalanchec_185c8bd7: usdcoinNetworks,
      usdc_matic_0a883d9b: usdcoinNetworks,
      usdc_ethereumarbone_2e1129c4: usdcoinNetworks,
      usdc_optimism_68bb70cd: usdcoinNetworks,
      usdc_basemainnet_b5a52617: usdcoinNetworks,
    })
  })

  test('selector creators are memoized', () => {
    expect(createNetworksByAssetSelector({ allAssetsSelector })).toEqual(
      createNetworksByAssetSelector({ allAssetsSelector })
    )
    expect(createParentCombinedNetworkAssetsSelector({ allAssetsSelector })).toEqual(
      createParentCombinedNetworkAssetsSelector({ allAssetsSelector })
    )
    expect(createCombinedNetworkChildrenAssetsSelector({ allAssetsSelector })).toEqual(
      createCombinedNetworkChildrenAssetsSelector({ allAssetsSelector })
    )
    expect(createWithoutParentCombinedNetworkAssetsSelector({ allAssetsSelector })).toEqual(
      createWithoutParentCombinedNetworkAssetsSelector({ allAssetsSelector })
    )
    expect(createWithParentCombinedNetworkAssetsSelector({ allAssetsSelector })).toEqual(
      createWithParentCombinedNetworkAssetsSelector({ allAssetsSelector })
    )

    const enabledAssetsSelector = () => {
      return {
        ethereum: true,
        bitcoin: true,
        usdcoin_algorand: true,
        usdcoin_solana: true,
        usdcoin_tron: true,
      }
    }

    expect(
      createEnabledWithParentCombinedNetworkAssetNamesSelector({
        allAssetsSelector,
        enabledAssetsSelector,
      })
    ).toEqual(
      createEnabledWithParentCombinedNetworkAssetNamesSelector({
        allAssetsSelector,
        enabledAssetsSelector,
      })
    )

    const newEnabledAssetsSelector = () => null

    expect(
      createEnabledWithParentCombinedNetworkAssetNamesSelector({
        allAssetsSelector,
        enabledAssetsSelector,
      }) !==
        createEnabledWithParentCombinedNetworkAssetNamesSelector({
          allAssetsSelector,
          enabledAssetsSelector: newEnabledAssetsSelector,
        })
    ).toBeTruthy()
  })

  test('getParentCombinedAssetSelector', () => {
    const getParentCombinedAssetSelector = createGetParentCombinedAssetSelector({
      allAssetsSelector,
    })
    const state = {}

    expect(getParentCombinedAssetSelector(state)('_usdcoin')).toEqual(assets._usdcoin)
    expect(getParentCombinedAssetSelector(state)('bitcoin')).toEqual(undefined)
  })

  test('createGetHasAssetsOnOtherChainsSelector', () => {
    const getHasAssetsOnOtherChainsSelector = createGetHasAssetsOnOtherChainsSelector({
      allAssetsSelector,
    })
    const state = {}

    expect(getHasAssetsOnOtherChainsSelector(state)('_usdcoin')).toEqual(true)
    expect(getHasAssetsOnOtherChainsSelector(state)('bitcoin')).toEqual(false)
  })
  test('createGetCombinedAssetFallbackSelector', () => {
    const getCombinedAssetFallbackSelector = createGetCombinedAssetFallbackSelector({
      allAssetsSelector,
    })
    const state = {}

    expect(getCombinedAssetFallbackSelector(state)('_usdcoin').name).toEqual('usdcoin')
    expect(getCombinedAssetFallbackSelector(state)('usdcoin_solana').name).toEqual('usdcoin')
    expect(getCombinedAssetFallbackSelector(state)('bitcoin').name).toEqual('bitcoin')
  })
  test('createCreateCombinedAssetChildrenNamesSelector', () => {
    const createCombinedAssetChildrenNamesSelector = createCreateCombinedAssetChildrenNamesSelector(
      {
        allAssetsSelector,
      }
    )
    const state = {}

    expect(createCombinedAssetChildrenNamesSelector('_usdcoin')(state)).toEqual(
      assets._usdcoin.combinedAssets.map((a) => a.name)
    )
    expect(createCombinedAssetChildrenNamesSelector('usdcoin_solana')(state)).toEqual([
      'usdcoin_solana',
    ])
    expect(createCombinedAssetChildrenNamesSelector('bitcoin')(state)).toEqual(['bitcoin'])
  })
})
