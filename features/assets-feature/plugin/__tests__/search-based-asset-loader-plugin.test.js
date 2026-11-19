import searchBasedAssetLoaderPluginDefinition from '../search-based-asset-loader-plugin.js'

const { factory: createPlugin } = searchBasedAssetLoaderPluginDefinition

// onLoad is fire-and-forget; let its background work settle before asserting.
const flushPromises = () => new Promise((resolve) => setImmediate(resolve))

const createMockStorage = (initialData = {}) => {
  const data = { ...initialData }
  return {
    get: jest.fn(async (key) => data[key]),
    set: jest.fn(async (key, value) => {
      data[key] = value
    }),
    _getData: () => data,
  }
}

const createDeps = (overrides = {}) => ({
  assetsModule: {
    searchTokens: jest.fn().mockResolvedValue([]),
    addRemoteTokens: jest.fn().mockResolvedValue([]),
  },
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
  storage: createMockStorage(),
  config: {
    searches: [],
  },
  ...overrides,
})

describe('search-based-asset-loader-plugin', () => {
  describe('onLoad', () => {
    it('does nothing when searches config is empty', async () => {
      const deps = createDeps()
      const { onLoad } = createPlugin(deps)

      onLoad()
      await flushPromises()

      expect(deps.assetsModule.searchTokens).not.toHaveBeenCalled()
      expect(deps.assetsModule.addRemoteTokens).not.toHaveBeenCalled()
    })

    it('does not block on the token loading network calls', async () => {
      let resolveSearch
      const deps = createDeps({
        assetsModule: {
          searchTokens: jest.fn().mockReturnValue(
            new Promise((resolve) => {
              resolveSearch = resolve
            })
          ),
          addRemoteTokens: jest.fn().mockResolvedValue([]),
        },
        config: {
          searches: [{ tags: ['tag'], baseAssetName: 'solana', lifecycleStatus: 'c' }],
        },
      })

      const { onLoad } = createPlugin(deps)

      expect(onLoad()).toBeUndefined()

      // Work is still pending: tokens have not been added yet.
      await flushPromises()
      expect(deps.assetsModule.addRemoteTokens).not.toHaveBeenCalled()

      resolveSearch([{ name: 'solana_token1' }])
      await flushPromises()
      expect(deps.assetsModule.addRemoteTokens).toHaveBeenCalled()
    })

    it('logs when the background load rejects before per-search handling', async () => {
      const deps = createDeps({
        storage: {
          get: jest.fn().mockRejectedValue(new Error('storage down')),
          set: jest.fn(),
        },
        config: {
          searches: [{ tags: ['tag'], baseAssetName: 'solana', lifecycleStatus: 'c' }],
        },
      })

      const { onLoad } = createPlugin(deps)
      onLoad()
      await flushPromises()

      expect(deps.logger.error).toHaveBeenCalledWith(
        'Failed to load searches:',
        'storage down',
        expect.any(Error)
      )
    })

    it('fetches and adds tokens for configured search', async () => {
      const deps = createDeps({
        assetsModule: {
          searchTokens: jest
            .fn()
            .mockResolvedValue([{ name: 'solana_token1' }, { name: 'solana_token2' }]),
          addRemoteTokens: jest.fn().mockResolvedValue([]),
        },
        config: {
          searches: [
            {
              tags: ['ondo_stock_token'],
              baseAssetName: 'solana',
              lifecycleStatus: 'c',
            },
          ],
        },
      })

      const { onLoad } = createPlugin(deps)
      onLoad()
      await flushPromises()

      expect(deps.assetsModule.searchTokens).toHaveBeenCalledWith({
        tags: ['ondo_stock_token'],
        baseAssetName: 'solana',
        lifecycleStatus: ['c'],
        pageSize: undefined,
      })
      expect(deps.assetsModule.addRemoteTokens).toHaveBeenCalledWith({
        tokenNames: ['solana_token1', 'solana_token2'],
        allowedStatusList: ['c'],
      })
    })

    it('does not call addRemoteTokens when no tokens found', async () => {
      const deps = createDeps({
        assetsModule: {
          searchTokens: jest.fn().mockResolvedValue([]),
          addRemoteTokens: jest.fn().mockResolvedValue([]),
        },
        config: {
          searches: [
            {
              tags: ['ondo_stock_token'],
              baseAssetName: 'solana',
              lifecycleStatus: 'c',
            },
          ],
        },
      })

      const { onLoad } = createPlugin(deps)
      onLoad()
      await flushPromises()

      expect(deps.assetsModule.searchTokens).toHaveBeenCalled()
      expect(deps.assetsModule.addRemoteTokens).not.toHaveBeenCalled()
    })

    it('handles searchTokens error gracefully', async () => {
      const deps = createDeps({
        assetsModule: {
          searchTokens: jest.fn().mockRejectedValue(new Error('Search failed')),
          addRemoteTokens: jest.fn().mockResolvedValue([]),
        },
        config: {
          searches: [
            {
              tags: ['ondo_stock_token'],
              baseAssetName: 'solana',
              lifecycleStatus: 'c',
            },
          ],
        },
      })

      const { onLoad } = createPlugin(deps)
      onLoad()
      await flushPromises()

      expect(deps.logger.error).toHaveBeenCalledWith(
        'Failed to load tokens:',
        'Search failed',
        expect.any(Error)
      )
      expect(deps.assetsModule.addRemoteTokens).not.toHaveBeenCalled()
    })

    it('processes multiple search configs sequentially', async () => {
      let callCount = 0
      const deps = createDeps({
        assetsModule: {
          searchTokens: jest.fn().mockImplementation(() => {
            const responses = [[{ name: 'solana_token1' }], [{ name: 'ethereum_token1' }]]
            return Promise.resolve(responses[callCount++] || [])
          }),
          addRemoteTokens: jest.fn().mockResolvedValue([]),
        },
        config: {
          searches: [
            {
              tags: ['tag1'],
              baseAssetName: 'solana',
              lifecycleStatus: 'c',
            },
            {
              tags: ['tag2'],
              baseAssetName: 'ethereum',
              lifecycleStatus: 'v',
            },
          ],
        },
      })

      const { onLoad } = createPlugin(deps)
      onLoad()
      await flushPromises()

      expect(deps.assetsModule.addRemoteTokens).toHaveBeenCalledTimes(2)
      expect(deps.assetsModule.addRemoteTokens).toHaveBeenNthCalledWith(1, {
        tokenNames: ['solana_token1'],
        allowedStatusList: ['c'],
      })
      expect(deps.assetsModule.addRemoteTokens).toHaveBeenNthCalledWith(2, {
        tokenNames: ['ethereum_token1'],
        allowedStatusList: ['v'],
      })
    })

    it('handles missing config gracefully', async () => {
      const deps = createDeps({ config: undefined })

      const { onLoad } = createPlugin(deps)
      onLoad()
      await flushPromises()

      expect(deps.assetsModule.searchTokens).not.toHaveBeenCalled()
      expect(deps.assetsModule.addRemoteTokens).not.toHaveBeenCalled()
    })

    it('skips invalid search configs and continues with valid ones', async () => {
      const deps = createDeps({
        assetsModule: {
          searchTokens: jest.fn().mockResolvedValue([{ name: 'solana_token1' }]),
          addRemoteTokens: jest.fn().mockResolvedValue([]),
        },
        config: {
          searches: [
            { tags: 'not-an-array', baseAssetName: 'solana', lifecycleStatus: 'c' },
            { baseAssetName: 'solana', lifecycleStatus: 'c' },
            { tags: [], baseAssetName: 'solana', lifecycleStatus: 'c' },
            { tags: ['valid'], baseAssetName: 'solana', lifecycleStatus: 'c' },
          ],
        },
      })

      const { onLoad } = createPlugin(deps)
      onLoad()
      await flushPromises()

      expect(deps.logger.error).toHaveBeenCalledTimes(3)
      expect(deps.assetsModule.searchTokens).toHaveBeenCalledTimes(1)
      expect(deps.assetsModule.searchTokens).toHaveBeenCalledWith({
        tags: ['valid'],
        baseAssetName: 'solana',
        lifecycleStatus: ['c'],
        pageSize: undefined,
      })
    })

    it('uses custom pageSize when configured', async () => {
      const deps = createDeps({
        assetsModule: {
          searchTokens: jest.fn().mockResolvedValue([{ name: 'solana_token1' }]),
          addRemoteTokens: jest.fn().mockResolvedValue([]),
        },
        config: {
          searches: [
            {
              tags: ['test_tag'],
              baseAssetName: 'solana',
              lifecycleStatus: 'c',
            },
          ],
          pageSize: 50,
        },
      })

      const { onLoad } = createPlugin(deps)
      onLoad()
      await flushPromises()

      expect(deps.assetsModule.searchTokens).toHaveBeenCalledWith({
        tags: ['test_tag'],
        baseAssetName: 'solana',
        lifecycleStatus: ['c'],
        pageSize: 50,
      })
    })

    it('handles array-based lifecycleStatus config', async () => {
      const deps = createDeps({
        assetsModule: {
          searchTokens: jest.fn().mockResolvedValue([{ name: 'solana_token1' }]),
          addRemoteTokens: jest.fn().mockResolvedValue([]),
        },
        config: {
          searches: [
            {
              tags: ['test_tag'],
              baseAssetName: 'solana',
              lifecycleStatus: ['c', 'v'],
            },
          ],
        },
      })

      const { onLoad } = createPlugin(deps)
      onLoad()
      await flushPromises()

      expect(deps.assetsModule.searchTokens).toHaveBeenCalledWith({
        tags: ['test_tag'],
        baseAssetName: 'solana',
        lifecycleStatus: ['c', 'v'],
        pageSize: undefined,
      })
      expect(deps.assetsModule.addRemoteTokens).toHaveBeenCalledWith({
        tokenNames: ['solana_token1'],
        allowedStatusList: ['c', 'v'],
      })
    })
  })

  describe('caching with refreshInterval', () => {
    it('skips search if recently loaded and not stale', async () => {
      const recentTimestamp = Date.now() - 1000
      const storage = createMockStorage({
        loadedSearches: {
          'ondo_stock_token:solana:c': recentTimestamp,
        },
      })

      const deps = createDeps({
        storage,
        assetsModule: {
          searchTokens: jest.fn().mockResolvedValue([]),
          addRemoteTokens: jest.fn().mockResolvedValue([]),
        },
        config: {
          searches: [
            {
              tags: ['ondo_stock_token'],
              baseAssetName: 'solana',
              lifecycleStatus: 'c',
            },
          ],
          refreshInterval: '7d',
        },
      })

      const { onLoad } = createPlugin(deps)
      onLoad()
      await flushPromises()

      expect(deps.assetsModule.searchTokens).not.toHaveBeenCalled()
      expect(deps.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Search still fresh, skipping')
      )
    })

    it('fetches if search is stale', async () => {
      const oldTimestamp = Date.now() - 8 * 24 * 60 * 60 * 1000
      const storage = createMockStorage({
        loadedSearches: {
          'ondo_stock_token:solana:c': oldTimestamp,
        },
      })

      const deps = createDeps({
        storage,
        assetsModule: {
          searchTokens: jest.fn().mockResolvedValue([{ name: 'solana_token1' }]),
          addRemoteTokens: jest.fn().mockResolvedValue([]),
        },
        config: {
          searches: [
            {
              tags: ['ondo_stock_token'],
              baseAssetName: 'solana',
              lifecycleStatus: 'c',
            },
          ],
          refreshInterval: '7d',
        },
      })

      const { onLoad } = createPlugin(deps)
      onLoad()
      await flushPromises()

      expect(deps.assetsModule.searchTokens).toHaveBeenCalled()
      expect(deps.assetsModule.addRemoteTokens).toHaveBeenCalled()
    })

    it('stores timestamp after successful load', async () => {
      const storage = createMockStorage()

      const deps = createDeps({
        storage,
        assetsModule: {
          searchTokens: jest.fn().mockResolvedValue([{ name: 'solana_token1' }]),
          addRemoteTokens: jest.fn().mockResolvedValue([]),
        },
        config: {
          searches: [
            {
              tags: ['ondo_stock_token'],
              baseAssetName: 'solana',
              lifecycleStatus: 'c',
            },
          ],
        },
      })

      const { onLoad } = createPlugin(deps)
      onLoad()
      await flushPromises()

      expect(storage.set).toHaveBeenCalledWith(
        'loadedSearches',
        expect.objectContaining({
          'ondo_stock_token:solana:c': expect.any(Number),
        })
      )
    })

    it('stores timestamp even when no tokens found', async () => {
      const storage = createMockStorage()

      const deps = createDeps({
        storage,
        assetsModule: {
          searchTokens: jest.fn().mockResolvedValue([]),
          addRemoteTokens: jest.fn().mockResolvedValue([]),
        },
        config: {
          searches: [
            {
              tags: ['ondo_stock_token'],
              baseAssetName: 'solana',
              lifecycleStatus: 'c',
            },
          ],
        },
      })

      const { onLoad } = createPlugin(deps)
      onLoad()
      await flushPromises()

      expect(storage.set).toHaveBeenCalled()
    })

    it('supports refreshInterval as milliseconds', async () => {
      const recentTimestamp = Date.now() - 1000
      const storage = createMockStorage({
        loadedSearches: {
          'ondo_stock_token:solana:c': recentTimestamp,
        },
      })

      const deps = createDeps({
        storage,
        assetsModule: {
          searchTokens: jest.fn().mockResolvedValue([]),
          addRemoteTokens: jest.fn().mockResolvedValue([]),
        },
        config: {
          searches: [
            {
              tags: ['ondo_stock_token'],
              baseAssetName: 'solana',
              lifecycleStatus: 'c',
            },
          ],
          refreshInterval: 60_000,
        },
      })

      const { onLoad } = createPlugin(deps)
      onLoad()
      await flushPromises()

      expect(deps.assetsModule.searchTokens).not.toHaveBeenCalled()
    })
  })

  describe('onClear', () => {
    it('deletes storage data', async () => {
      const storage = createMockStorage({
        loadedSearches: { 'test:solana:c': Date.now() },
      })
      storage.delete = jest.fn()

      const deps = createDeps({ storage })
      const { onClear } = createPlugin(deps)
      await onClear()

      expect(storage.delete).toHaveBeenCalledWith('loadedSearches')
    })
  })
})
