const TRUSTED_LIFECYCLE = new Set(['c'])
const MIN_ASSETS_TO_COMBINE = 2

const normalizeForKey = (str) => str.toLowerCase().trim()

const normalizeForName = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '')

const createGroupKey = (displayTicker, displayName) =>
  `${normalizeForKey(displayTicker)}::${normalizeForKey(displayName)}`

const getGroupingAsset = (asset, { assets = {}, overrides = Object.create(null) } = {}) => {
  if (!Object.hasOwn(overrides, asset.name)) return asset

  const target = assets[overrides[asset.name]]
  return target && !target.isCombined && shouldTokenJoinCombinedAsset(target) ? target : null
}

export const getDynamicCombinedAssetKey = (asset, options) => {
  const groupingAsset = getGroupingAsset(asset, options)
  if (!groupingAsset) return null

  const { displayTicker, displayName } = groupingAsset
  return displayTicker && displayName ? createGroupKey(displayTicker, displayName) : null
}

const groupAssetsByTickerAndName = (assets, options) => {
  const groups = Object.create(null)

  for (const asset of assets) {
    if (asset.isCombined) continue

    const key = getDynamicCombinedAssetKey(asset, options)
    if (!key) continue
    if (!groups[key]) groups[key] = []
    groups[key].push(asset)
  }

  return groups
}

const isTestnetVariant = (asset) => asset.baseAsset?.api?.features?.isTestnet === true

const byName = (a, b) => a.name.localeCompare(b.name)

const resolveDecimals = (assets) => {
  const decimals = assets.map((a) => a.currency?.defaultUnit?.power ?? 8)
  return Math.max(...decimals)
}

const createDynamicCombinedAssetDefinition = (assetGroup, { overrides }) => {
  const sortedAssets = [...assetGroup].sort(byName)
  const targetNames = new Set(Object.values(overrides))
  const overrideTarget = sortedAssets.find((asset) => targetNames.has(asset.name))
  const primary = overrideTarget ?? sortedAssets[0]
  const members = [primary, ...sortedAssets.filter((asset) => asset !== primary)]

  const normalizedTicker = normalizeForName(primary.displayTicker)
  const normalizedDisplayName = normalizeForName(primary.displayName)
  const decimals = resolveDecimals(assetGroup)

  const name = `_combined_${normalizedTicker}_${normalizedDisplayName}`
  const ticker = name.toUpperCase()

  return {
    name,
    ticker,
    baseAssetName: name,
    displayName: primary.displayName,
    displayTicker: primary.displayTicker,
    assetType: 'MULTI_NETWORK_ASSET',
    units: {
      [`${name}_base`]: 0,
      [ticker]: decimals,
    },
    combinedAssetNames: members.map((a) => a.name),
    info: primary.info || { description: '' },
    primaryColor: primary.primaryColor || '#888888',
    gradientColors: primary.gradientColors || ['#888888', '#666666'],
    chainBadgeColors: primary.chainBadgeColors || primary.gradientColors || ['#888888', '#666666'],
  }
}

export const isTrustedAsset = (asset) => {
  // Built-in assets (bundled with app, not fetched from CTR) are trusted
  if (asset.isBuiltIn === true && asset.isCustomToken !== true) return true

  // Curated custom tokens from CTR are trusted (Exodus controls curation)
  if (TRUSTED_LIFECYCLE.has(asset.lifecycleStatus)) return true

  return false
}

export const createDynamicCombinedAssetDefinitions = (
  assets,
  { overrides = Object.create(null) } = {}
) => {
  const assetList = Array.isArray(assets) ? assets : Object.values(assets)
  const options = {
    assets: Object.fromEntries(assetList.map((asset) => [asset.name, asset])),
    overrides,
  }
  const trustedAssets = assetList.filter(
    (asset) => isTrustedAsset(asset) && !isTestnetVariant(asset)
  )
  const groups = groupAssetsByTickerAndName(trustedAssets, options)

  const definitions = []
  for (const assetGroup of Object.values(groups)) {
    if (assetGroup.length >= MIN_ASSETS_TO_COMBINE) {
      definitions.push(createDynamicCombinedAssetDefinition(assetGroup, options))
    }
  }

  return definitions
}

export const findDynamicCombinedAssetForToken = (token, existingCombinedAssets, options) => {
  const tokenKey = getDynamicCombinedAssetKey(token, options)
  if (!tokenKey) return null

  for (const combined of existingCombinedAssets) {
    if (!combined.isCombined) continue
    if (!combined.displayTicker || !combined.displayName) continue

    const combinedKey = createGroupKey(combined.displayTicker, combined.displayName)
    if (combinedKey === tokenKey) return combined
  }

  return null
}

export const shouldTokenJoinCombinedAsset = (token) =>
  isTrustedAsset(token) && !isTestnetVariant(token)
