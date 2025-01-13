import { mapValues, pick } from '@exodus/basic-utils'
import NumberUnit, { UnitType } from '@exodus/currency'
import assert from 'minimalistic-assert'
import { createBasicDomainSerialization } from './domain-serialization.js'

// This is for optimizing deserialization, so that we do not attempt it on fields that are known to not need it.
const SERIALIZABLE_PROPS = new Set([
  'assetType',
  'baseAssetName',
  'bip44',
  'chainBadgeColors',
  'displayName',
  'displayNetworkName',
  'displayNetworkTicker',
  'displayTicker',
  'gradientColors',
  'gradientCoords',
  'info',
  'isBuiltIn',
  'isCustomToken',
  'name',
  'primaryColor',
  'properName',
  'properTicker',
  'ticker',
  'units',
])

const { deserialize: deserializeArg, serialize: serializeArg } = createBasicDomainSerialization()

const PROXIED_FUNCTION = null

// called on the background process
export const assetsApi = async (asset, functionName, ...args) => {
  assert(asset, `missing asset in assetProxy`)
  const assetName = asset.name
  assert(assetName && functionName, 'missing args in assetProxy')
  const parts = functionName.split('.')
  assert(parts[0], `missing function name in assetProxy for ${assetName}`)
  const [apiName, name] = parts[1] ? parts : ['api', parts[0]]
  const api = asset[apiName]
  assert(api && api[name], `invalid member in assetProxy for ${assetName}`)
  const deserializedArgs = args.map((arg) => deserializeArg(arg))
  const result = await api[name](...deserializedArgs)
  return serializeArg(result)
}

const deserializeApis = (asset, proxyFunction) =>
  Object.fromEntries(
    ['address', 'api', 'blockExplorer', 'keys'].map((apiName) => [
      apiName,
      mapValues(asset[apiName], (value, name) => {
        switch (name) {
          case 'features':
            return value
          default:
            return async (...args) => {
              const serializedArgs = args.map((arg) => serializeArg(arg))
              const result = await proxyFunction(
                asset.name,
                `${apiName}.${name}`,
                ...serializedArgs
              )
              return deserializeArg(result)
            }
        }
      }),
    ])
  )

const serializeApis = ({ address, keys, api, blockExplorer }) => ({
  // Add any new functions that need to be exported to the UI into the lists below:
  address: mapValues(pick(address, ['validate', 'resolvePurpose']), () => PROXIED_FUNCTION),
  api: mapValues(
    pick(api, ['features', 'getFee', 'hasFeature', 'validateAssetId']),
    (value, key) => {
      switch (key) {
        case 'features':
          return value
        default:
          return PROXIED_FUNCTION
      }
    }
  ),
  blockExplorer: mapValues(pick(blockExplorer, ['addressUrl', 'txUrl']), () => PROXIED_FUNCTION),
  keys: mapValues(pick(keys, ['encodePublic', 'encodePrivate']), () => PROXIED_FUNCTION),
})

const deserializePassOne = (asset, proxyFunction) => {
  return {
    ...mapValues(asset, (v, k) => (SERIALIZABLE_PROPS.has(k) ? v : deserializeArg(v))),
    currency: UnitType.create(asset.units),
    toString: () => asset.name,
    ...deserializeApis(asset, proxyFunction),
  }
}

const deserializePassTwo = (asset, _assets) => {
  const getAsset = (assetName) => {
    const asset = _assets[assetName]
    assert(asset, `asset ${assetName} could not be deserialized`)
    return asset
  }

  // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
  asset.baseAsset = getAsset(asset.baseAssetName)
  // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
  asset.feeAsset = getAsset(asset.feeAssetName)

  if (asset.isCombined) {
    // TODO: handle case when there are no assets to combine
    // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
    asset.combinedAssetNames = asset.combinedAssetNames.filter((assetName) => _assets[assetName])
    // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
    asset.combinedAssets = asset.combinedAssetNames.map((assetName) => _assets[assetName])
  }

  return asset
}

export const serializeAsset = ({
  address,
  contract,
  currency,
  keys,
  api,
  baseAsset,
  feeAsset,
  combinedAssets,
  blockExplorer,
  server, // skip serialization, backend only complex object.
  insightClient, // skip serialization, backend only complex object.
  ...asset
}) => ({
  ...mapValues(asset, (v) => (NumberUnit.isNumberUnit(v) ? serializeArg(v) : v)),
  ...serializeApis({ address, keys, api, blockExplorer }),
  baseAssetName: baseAsset.name,
  feeAssetName: feeAsset.name,
})

export function serializeAssets(assets) {
  return Array.isArray(assets) ? assets.map(serializeAsset) : mapValues()
}

// assetsList: assets to update
// assets: all assets in redux
// proxyFunction: ui.rpc.assetsApi(assetName, ...args) -> (assetName, ...args) => assetsApi(getAsset(assetName), ...args)
export function deserializeAssets(assetsList, assets, proxyFunction) {
  if (!assetsList) return []

  const partiallyDeserialized = assetsList.map((asset) => deserializePassOne(asset, proxyFunction))
  const allAssets = {
    ...assets,
    ...Object.fromEntries(partiallyDeserialized.map((asset) => [asset.name, asset])),
  }
  return partiallyDeserialized.map((asset) => deserializePassTwo(asset, allAssets))
}
