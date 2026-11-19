import ms from 'ms'

const toArray = (value) => (Array.isArray(value) ? value : [value])

const STORAGE_KEY = 'loadedSearches'
const DEFAULT_REFRESH_INTERVAL = '8h'

const isValidSearchConfig = ({ tags, baseAssetName, lifecycleStatus }) =>
  Array.isArray(tags) && tags.length > 0 && baseAssetName && lifecycleStatus

const getSearchHash = ({ tags, baseAssetName, lifecycleStatus }) => {
  const sortedTags = [...tags].sort().join(',')
  const sortedStatus = [...toArray(lifecycleStatus)].sort().join(',')
  return `${sortedTags}:${baseAssetName}:${sortedStatus}`
}

const createSearchBasedAssetLoaderPlugin = ({
  assetsModule,
  logger,
  storage,
  config: { searches = [], refreshInterval = DEFAULT_REFRESH_INTERVAL, pageSize } = {},
}) => {
  const refreshIntervalMs =
    typeof refreshInterval === 'string' ? ms(refreshInterval) : refreshInterval

  const getLoadedSearches = async () => {
    return (await storage.get(STORAGE_KEY)) || {}
  }

  const markSearchAsLoaded = async (hash) => {
    const loadedSearches = await getLoadedSearches()
    await storage.set(STORAGE_KEY, { ...loadedSearches, [hash]: Date.now() })
  }

  const isSearchStale = (loadedSearches, hash) => {
    const lastLoaded = loadedSearches[hash]
    return !lastLoaded || Date.now() - lastLoaded > refreshIntervalMs
  }

  const loadTokensForSearch = async (searchConfig, loadedSearches) => {
    if (!isValidSearchConfig(searchConfig)) {
      logger.error('Invalid search config, skipping:', JSON.stringify(searchConfig))
      return
    }

    const { tags, baseAssetName, lifecycleStatus } = searchConfig
    const lifecycleStatusList = toArray(lifecycleStatus)
    const hash = getSearchHash(searchConfig)

    if (!isSearchStale(loadedSearches, hash)) {
      logger.info(`Search still fresh, skipping: ${hash}`)
      return
    }

    try {
      logger.info(
        `Fetching tokens: tags=${tags.join(',')}, baseAsset=${baseAssetName}, status=${lifecycleStatusList.join(',')}`
      )

      const tokens = await assetsModule.searchTokens({
        tags,
        baseAssetName,
        lifecycleStatus: lifecycleStatusList,
        pageSize,
      })

      if (tokens.length === 0) {
        logger.info('No tokens found for search criteria')
        await markSearchAsLoaded(hash)
        return
      }

      const tokenNames = tokens.map((t) => t.name)
      await assetsModule.addRemoteTokens({
        tokenNames,
        allowedStatusList: lifecycleStatusList,
      })

      await markSearchAsLoaded(hash)
      logger.info(`Loaded ${tokens.length} tokens`)
    } catch (error) {
      logger.error('Failed to load tokens:', error.message, error)
    }
  }

  const loadAllSearches = async () => {
    const loadedSearches = await getLoadedSearches()
    for (const searchConfig of searches) {
      await loadTokensForSearch(searchConfig, loadedSearches)
    }
  }

  // Fire-and-forget: token loading makes a series of network calls that must not block app startup.
  const onLoad = () => {
    loadAllSearches().catch((error) => {
      logger.error('Failed to load searches:', error.message, error)
    })
  }

  const onClear = async () => {
    await storage.delete(STORAGE_KEY)
  }

  return { onLoad, onClear }
}

const searchBasedAssetLoaderPluginDefinition = {
  id: 'searchBasedAssetLoaderPlugin',
  type: 'plugin',
  factory: createSearchBasedAssetLoaderPlugin,
  dependencies: ['assetsModule', 'logger', 'storage', 'config?'],
}

export default searchBasedAssetLoaderPluginDefinition
