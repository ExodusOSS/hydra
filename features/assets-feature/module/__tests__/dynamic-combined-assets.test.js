import {
  createDynamicCombinedAssetDefinitions,
  findDynamicCombinedAssetForToken,
  isTrustedAsset,
  shouldTokenJoinCombinedAsset,
} from '../dynamic-combined-assets.js'

const createMockCurrency = (power) => ({
  defaultUnit: { power },
})

const createMockAsset = (overrides = {}) => ({
  name: 'test_asset',
  displayTicker: 'TEST',
  displayName: 'Test Asset',
  isBuiltIn: true,
  lifecycleStatus: undefined,
  isCombined: false,
  currency: createMockCurrency(8),
  primaryColor: '#FF0000',
  gradientColors: ['#FF0000', '#CC0000'],
  chainBadgeColors: ['#FF0000', '#CC0000'],
  info: { description: 'Test asset description' },
  ...overrides,
})

const createMockTestnetAsset = (overrides = {}) =>
  createMockAsset({ baseAsset: { api: { features: { isTestnet: true } } }, ...overrides })

describe('dynamic-combined-assets', () => {
  describe('configured grouping identity', () => {
    const bitcoin = createMockAsset({
      name: 'bitcoin',
      displayName: 'Bitcoin',
      displayTicker: 'BTC',
    })
    const cbBTC = createMockAsset({
      name: 'cbbtc_basemainnet_58df8ab4',
      displayName: 'Coinbase Wrapped BTC',
      displayTicker: 'cbBTC',
      isBuiltIn: false,
      isCustomToken: true,
      lifecycleStatus: 'c',
    })
    const overrides = { [cbBTC.name]: bitcoin.name }

    it.each([false, true])('maps only the configured token (reversed: %s)', (reverse) => {
      const otherTokens = ['cbbtc_ethereum', 'cbbtc_solana'].map((name) => ({ ...cbBTC, name }))
      const assets = [bitcoin, cbBTC, ...otherTokens]
      const definitions = createDynamicCombinedAssetDefinitions(
        reverse ? assets.toReversed() : assets,
        { overrides }
      )
      expect(definitions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: '_combined_btc_bitcoin',
            displayTicker: 'BTC',
            combinedAssetNames: [bitcoin.name, cbBTC.name],
          }),
          expect.objectContaining({
            name: '_combined_cbbtc_coinbasewrappedbtc',
            combinedAssetNames: otherTokens.map((asset) => asset.name),
          }),
        ])
      )
      expect(definitions).toHaveLength(2)
      expect(cbBTC.displayName).toBe('Coinbase Wrapped BTC')
      expect(cbBTC.displayTicker).toBe('cbBTC')
    })

    it('uses the target as primary even when the wrapper sorts first', () => {
      const wrapper = { ...cbBTC, name: 'a_wrapper', primaryColor: '#FFFFFF' }
      const [definition] = createDynamicCombinedAssetDefinitions([wrapper, bitcoin], {
        overrides: { [wrapper.name]: bitcoin.name },
      })
      expect(definition).toMatchObject({
        name: '_combined_btc_bitcoin',
        displayName: bitcoin.displayName,
        displayTicker: bitcoin.displayTicker,
        primaryColor: bitcoin.primaryColor,
        combinedAssetNames: [bitcoin.name, wrapper.name],
      })
    })

    it('matches a late token to the existing target group', () => {
      const [definition] = createDynamicCombinedAssetDefinitions([bitcoin, cbBTC], { overrides })
      const combined = { ...definition, isCombined: true }
      expect(
        findDynamicCombinedAssetForToken(cbBTC, [combined], {
          assets: { bitcoin },
          overrides,
        })
      ).toBe(combined)
      expect(findDynamicCombinedAssetForToken(cbBTC, [combined])).toBeNull()
    })

    it.each(['u', 'v', 'd'])('does not bypass lifecycle eligibility: %s', (lifecycleStatus) => {
      expect(
        createDynamicCombinedAssetDefinitions([bitcoin, { ...cbBTC, lifecycleStatus }], {
          overrides,
        })
      ).toEqual([])
    })

    it.each(['source', 'target'])('excludes a testnet %s', (side) => {
      const testnet = { api: { features: { isTestnet: true } } }
      const assets = [
        side === 'target' ? { ...bitcoin, baseAsset: testnet } : bitcoin,
        side === 'source' ? { ...cbBTC, baseAsset: testnet } : cbBTC,
      ]
      expect(createDynamicCombinedAssetDefinitions(assets, { overrides })).toEqual([])
    })

    it('does not manufacture a missing target or a singleton group', () => {
      expect(createDynamicCombinedAssetDefinitions([cbBTC], { overrides })).toEqual([])
      expect(createDynamicCombinedAssetDefinitions([bitcoin], { overrides })).toEqual([])
      expect(
        createDynamicCombinedAssetDefinitions([bitcoin, cbBTC], {
          overrides: { [cbBTC.name]: 'missing' },
        })
      ).toEqual([])
    })

    it.each([
      ['missing', undefined],
      ['untrusted', { ...bitcoin, isBuiltIn: false, lifecycleStatus: 'u' }],
      ['testnet', { ...bitcoin, baseAsset: { api: { features: { isTestnet: true } } } }],
      ['combined', { ...bitcoin, isCombined: true }],
    ])('does not group wrappers when their configured target is %s', (_, target) => {
      const wrappers = [cbBTC, { ...cbBTC, name: 'cbbtc_ethereum' }]
      const assets = [...wrappers, ...(target ? [target] : [])]
      const overrides = Object.fromEntries(wrappers.map(({ name }) => [name, bitcoin.name]))
      const [wrapperGroup] = createDynamicCombinedAssetDefinitions(wrappers)

      expect(createDynamicCombinedAssetDefinitions(assets, { overrides })).toEqual([])
      expect(
        findDynamicCombinedAssetForToken(cbBTC, [{ ...wrapperGroup, isCombined: true }], {
          assets: Object.fromEntries(assets.map((asset) => [asset.name, asset])),
          overrides,
        })
      ).toBeNull()
    })
  })

  describe('isTrustedAsset', () => {
    it('returns true for built-in assets', () => {
      const asset = createMockAsset({ isBuiltIn: true })
      expect(isTrustedAsset(asset)).toBe(true)
    })

    it('returns true for curated assets', () => {
      const asset = createMockAsset({ isBuiltIn: false, lifecycleStatus: 'c' })
      expect(isTrustedAsset(asset)).toBe(true)
    })

    it('returns false for verified assets', () => {
      const asset = createMockAsset({ isBuiltIn: false, lifecycleStatus: 'v' })
      expect(isTrustedAsset(asset)).toBe(false)
    })

    it('returns false for unverified assets', () => {
      const asset = createMockAsset({ isBuiltIn: false, lifecycleStatus: 'u' })
      expect(isTrustedAsset(asset)).toBe(false)
    })

    it('returns false for disabled assets', () => {
      const asset = createMockAsset({ isBuiltIn: false, lifecycleStatus: 'd' })
      expect(isTrustedAsset(asset)).toBe(false)
    })

    it('returns true for curated custom tokens from CTR', () => {
      const asset = createMockAsset({ isBuiltIn: false, lifecycleStatus: 'c', isCustomToken: true })
      expect(isTrustedAsset(asset)).toBe(true)
    })

    it('returns false for custom tokens claiming to be built-in without curation', () => {
      const asset = createMockAsset({
        isBuiltIn: true,
        isCustomToken: true,
        lifecycleStatus: undefined,
      })
      expect(isTrustedAsset(asset)).toBe(false)
    })
  })

  describe('createDynamicCombinedAssetDefinitions', () => {
    it('groups assets by displayTicker and displayName', () => {
      const assets = [
        createMockAsset({ name: 'usdcoin', displayTicker: 'USDC', displayName: 'USD Coin' }),
        createMockAsset({
          name: 'usdcoin_solana',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
        }),
        createMockAsset({ name: 'bitcoin', displayTicker: 'BTC', displayName: 'Bitcoin' }),
      ]

      const definitions = createDynamicCombinedAssetDefinitions(assets)

      expect(definitions).toHaveLength(1)
      expect(definitions[0].name).toBe('_combined_usdc_usdcoin')
      expect(definitions[0].combinedAssetNames).toEqual(['usdcoin', 'usdcoin_solana'])
    })

    it('is case-insensitive for grouping', () => {
      const assets = [
        createMockAsset({ name: 'asset1', displayTicker: 'USDC', displayName: 'USD Coin' }),
        createMockAsset({ name: 'asset2', displayTicker: 'usdc', displayName: 'usd coin' }),
      ]

      const definitions = createDynamicCombinedAssetDefinitions(assets)

      expect(definitions).toHaveLength(1)
      expect(definitions[0].combinedAssetNames).toHaveLength(2)
    })

    it('excludes assets without displayTicker or displayName', () => {
      const assets = [
        createMockAsset({ name: 'valid1', displayTicker: 'USDC', displayName: 'USD Coin' }),
        createMockAsset({ name: 'valid2', displayTicker: 'USDC', displayName: 'USD Coin' }),
        createMockAsset({ name: 'no_ticker', displayTicker: null, displayName: 'No Ticker' }),
        createMockAsset({ name: 'no_name', displayTicker: 'NT', displayName: null }),
      ]

      const definitions = createDynamicCombinedAssetDefinitions(assets)

      expect(definitions).toHaveLength(1)
      expect(definitions[0].combinedAssetNames).toEqual(['valid1', 'valid2'])
    })

    it('excludes already combined assets', () => {
      const assets = [
        createMockAsset({ name: 'usdcoin', displayTicker: 'USDC', displayName: 'USD Coin' }),
        createMockAsset({
          name: 'usdcoin_solana',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
        }),
        createMockAsset({
          name: '_usdcoin',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
          isCombined: true,
        }),
      ]

      const definitions = createDynamicCombinedAssetDefinitions(assets)

      expect(definitions).toHaveLength(1)
      expect(definitions[0].combinedAssetNames).toEqual(['usdcoin', 'usdcoin_solana'])
    })

    it('excludes untrusted assets', () => {
      const assets = [
        createMockAsset({
          name: 'trusted1',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
          isBuiltIn: true,
        }),
        createMockAsset({
          name: 'trusted2',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
          isBuiltIn: false,
          lifecycleStatus: 'c',
        }),
        createMockAsset({
          name: 'untrusted',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
          isBuiltIn: false,
          lifecycleStatus: 'u',
        }),
      ]

      const definitions = createDynamicCombinedAssetDefinitions(assets)

      expect(definitions).toHaveLength(1)
      expect(definitions[0].combinedAssetNames).toEqual(['trusted1', 'trusted2'])
    })

    it('does not create combined asset for single-asset groups', () => {
      const assets = [
        createMockAsset({ name: 'bitcoin', displayTicker: 'BTC', displayName: 'Bitcoin' }),
        createMockAsset({ name: 'ethereum', displayTicker: 'ETH', displayName: 'Ethereum' }),
      ]

      const definitions = createDynamicCombinedAssetDefinitions(assets)

      expect(definitions).toHaveLength(0)
    })

    it('creates multiple combined assets for different groups', () => {
      const assets = [
        createMockAsset({ name: 'usdcoin', displayTicker: 'USDC', displayName: 'USD Coin' }),
        createMockAsset({
          name: 'usdcoin_solana',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
        }),
        createMockAsset({ name: 'usdt', displayTicker: 'USDT', displayName: 'Tether USD' }),
        createMockAsset({ name: 'usdt_tron', displayTicker: 'USDT', displayName: 'Tether USD' }),
      ]

      const definitions = createDynamicCombinedAssetDefinitions(assets)

      expect(definitions).toHaveLength(2)
      const names = definitions.map((c) => c.name).sort()
      expect(names).toEqual(['_combined_usdc_usdcoin', '_combined_usdt_tetherusd'])
    })

    it('uses deterministic ordering for combinedAssetNames', () => {
      const assets = [
        createMockAsset({
          name: 'zebra_usdc',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
        }),
        createMockAsset({
          name: 'alpha_usdc',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
        }),
        createMockAsset({
          name: 'middle_usdc',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
        }),
      ]

      const definitions = createDynamicCombinedAssetDefinitions(assets)

      expect(definitions[0].combinedAssetNames).toEqual(['alpha_usdc', 'middle_usdc', 'zebra_usdc'])
    })

    it('excludes testnet variants from combined assets', () => {
      const assets = [
        createMockTestnetAsset({
          name: '4zmm_solanadevnet_1318d07d',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
        }),
        createMockAsset({ name: 'usdcoin_solana', displayTicker: 'USDC', displayName: 'USD Coin' }),
        createMockAsset({ name: 'usdcoin', displayTicker: 'USDC', displayName: 'USD Coin' }),
      ]

      const definitions = createDynamicCombinedAssetDefinitions(assets)

      expect(definitions[0].combinedAssetNames).toEqual(['usdcoin', 'usdcoin_solana'])
    })

    it('does not create combined asset when only testnet variants remain after filtering', () => {
      const assets = [
        createMockTestnetAsset({
          name: 'usdc_regtest',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
        }),
        createMockTestnetAsset({
          name: '4zmm_solanadevnet_1318d07d',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
        }),
        createMockAsset({ name: 'usdcoin', displayTicker: 'USDC', displayName: 'USD Coin' }),
      ]

      const definitions = createDynamicCombinedAssetDefinitions(assets)

      expect(definitions).toEqual([])
    })

    it('does not create combined asset when only one mainnet variant exists alongside testnets', () => {
      const assets = [
        createMockTestnetAsset({
          name: '4zmm_solanadevnet_1318d07d',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
          info: { description: 'devnet description' },
          primaryColor: '#DEADBE',
        }),
        createMockAsset({
          name: 'usdcoin',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
          info: { description: 'mainnet description' },
          primaryColor: '#2775CA',
        }),
      ]

      const definitions = createDynamicCombinedAssetDefinitions(assets)

      expect(definitions).toEqual([])
    })

    it('uses highest decimals from group', () => {
      const assets = [
        createMockAsset({
          name: 'usdc_6',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
          currency: createMockCurrency(6),
        }),
        createMockAsset({
          name: 'usdc_8',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
          currency: createMockCurrency(8),
        }),
        createMockAsset({
          name: 'usdc_18',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
          currency: createMockCurrency(18),
        }),
      ]

      const definitions = createDynamicCombinedAssetDefinitions(assets)

      expect(definitions[0].units['_COMBINED_USDC_USDCOIN']).toBe(18)
    })

    it('accepts object input as well as array', () => {
      const assets = {
        usdcoin: createMockAsset({
          name: 'usdcoin',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
        }),
        usdcoin_solana: createMockAsset({
          name: 'usdcoin_solana',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
        }),
      }

      const definitions = createDynamicCombinedAssetDefinitions(assets)

      expect(definitions).toHaveLength(1)
      expect(definitions[0].name).toBe('_combined_usdc_usdcoin')
    })

    it('creates valid combined asset definition structure', () => {
      const assets = [
        createMockAsset({
          name: 'usdcoin',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
          info: { description: 'USDC description' },
        }),
        createMockAsset({
          name: 'usdcoin_solana',
          displayTicker: 'USDC',
          displayName: 'USD Coin',
        }),
      ]

      const definitions = createDynamicCombinedAssetDefinitions(assets)
      const [usdc] = definitions

      expect(usdc.name).toBe('_combined_usdc_usdcoin')
      expect(usdc.ticker).toBe('_COMBINED_USDC_USDCOIN')
      expect(usdc.displayName).toBe('USD Coin')
      expect(usdc.displayTicker).toBe('USDC')
      expect(usdc.assetType).toBe('MULTI_NETWORK_ASSET')
      expect(usdc.combinedAssetNames).toEqual(['usdcoin', 'usdcoin_solana'])
      expect(usdc.units).toBeDefined()
      expect(usdc.info).toBeDefined()
      expect(usdc.primaryColor).toBeDefined()
      expect(usdc.gradientColors).toBeDefined()
      expect(usdc.chainBadgeColors).toBeDefined()
    })
  })

  describe('findDynamicCombinedAssetForToken', () => {
    it('finds matching combined asset for token', () => {
      const token = { displayTicker: 'USDC', displayName: 'USD Coin' }
      const combinedAssets = [
        {
          name: '_combined_usdc_usdcoin',
          isCombined: true,
          displayTicker: 'USDC',
          displayName: 'USD Coin',
        },
        {
          name: '_combined_usdt',
          isCombined: true,
          displayTicker: 'USDT',
          displayName: 'Tether USD',
        },
      ]

      const result = findDynamicCombinedAssetForToken(token, combinedAssets)

      expect(result.name).toBe('_combined_usdc_usdcoin')
    })

    it('returns null when no match found', () => {
      const token = { displayTicker: 'ETH', displayName: 'Ethereum' }
      const combinedAssets = [
        {
          name: '_combined_usdc_usdcoin',
          isCombined: true,
          displayTicker: 'USDC',
          displayName: 'USD Coin',
        },
      ]

      const result = findDynamicCombinedAssetForToken(token, combinedAssets)

      expect(result).toBeNull()
    })

    it('returns null for token without displayTicker', () => {
      const token = { displayName: 'USD Coin' }
      const combinedAssets = [
        {
          name: '_combined_usdc_usdcoin',
          isCombined: true,
          displayTicker: 'USDC',
          displayName: 'USD Coin',
        },
      ]

      const result = findDynamicCombinedAssetForToken(token, combinedAssets)

      expect(result).toBeNull()
    })

    it('is case-insensitive', () => {
      const token = { displayTicker: 'usdc', displayName: 'usd coin' }
      const combinedAssets = [
        {
          name: '_combined_usdc_usdcoin',
          isCombined: true,
          displayTicker: 'USDC',
          displayName: 'USD Coin',
        },
      ]

      const result = findDynamicCombinedAssetForToken(token, combinedAssets)

      expect(result.name).toBe('_combined_usdc_usdcoin')
    })
  })

  describe('shouldTokenJoinCombinedAsset', () => {
    it('returns true for built-in tokens', () => {
      const token = { isBuiltIn: true }
      expect(shouldTokenJoinCombinedAsset(token)).toBe(true)
    })

    it('returns true for curated tokens', () => {
      const token = { isBuiltIn: false, lifecycleStatus: 'c' }
      expect(shouldTokenJoinCombinedAsset(token)).toBe(true)
    })

    it('returns false for unverified tokens', () => {
      const token = { isBuiltIn: false, lifecycleStatus: 'u' }
      expect(shouldTokenJoinCombinedAsset(token)).toBe(false)
    })

    it('returns false for testnet tokens even if built-in', () => {
      const token = { isBuiltIn: true, baseAsset: { api: { features: { isTestnet: true } } } }
      expect(shouldTokenJoinCombinedAsset(token)).toBe(false)
    })
  })
})
