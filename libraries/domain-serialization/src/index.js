import { mapValues } from '@exodus/basic-utils'
import isEmpty from 'lodash/isEmpty'
import assert from 'minimalistic-assert'
import { deserializeAssets, serializeAsset } from './assets-serialization.js'
import { createBasicDomainSerialization } from './domain-serialization.js'

function isAsset(v) {
  return v && v.name && v.currency && v.assetType // if it quacks like and asset, it must be an asset
}

/**
 * @typedef {*} Asset
 */

/**
 * Create serialization functions for a wide range of domain and native objects
 * @param {object} [deps]
 * @param {(asset: Asset) => object} [deps.serializeAsset]
 * @param {(asset: object) => Asset} [deps.deserializeAsset]
 * @param {(assets: object[]) => Asset[]} [deps.deserializeAssets]
 * @param {object} [deps.excludeSerialization]
 * @returns {{serialize: (payload: object) => string, deserialize: (payload: string) => object}}
 */
const createDomainSerialization = ({
  serializeAsset,
  deserializeAsset,
  deserializeAssets, // optional
  excludeSerialization,
} = {}) => {
  const assetTypeDefinitions = []

  if (serializeAsset && deserializeAsset) {
    const resolvedDeserializeAssets = deserializeAssets || ((list) => list.map(deserializeAsset))

    assetTypeDefinitions.push(
      {
        type: 'asset',
        test: isAsset,
        serialize: serializeAsset,
        deserialize: deserializeAsset,
      },
      {
        type: 'assetsList',
        test: (list) => list && Array.isArray(list) && !isEmpty(list) && list.every(isAsset),
        serialize: (list) => list.map(serializeAsset),
        deserialize: resolvedDeserializeAssets,
      },
      {
        type: 'assetsMap',
        test: (obj) =>
          obj && typeof obj === 'object' && !isEmpty(obj) && Object.values(obj).every(isAsset),
        serialize: (obj) => mapValues(obj, serializeAsset),
        deserialize: (obj) => {
          const list = Object.values(obj)
          const assets = resolvedDeserializeAssets(list)
          return Object.fromEntries(assets.map((asset) => [asset.name, asset]))
        },
      }
    )
  }

  const serializer = createBasicDomainSerialization({
    extraTypeDefinitions: assetTypeDefinitions,
    excludeSerialization,
  })

  const serialize = (arg) => {
    try {
      return JSON.stringify(serializer.serialize(arg))
    } catch (e) {
      console.error(`Cannot serialize: ${e.message}`, arg, e)
      throw e
    }
  }

  const deserialize = (arg) => {
    try {
      return serializer.deserialize(typeof arg === 'string' ? JSON.parse(arg) : arg)
    } catch (e) {
      console.error(`Cannot deserialize: ${e.message}`, arg, e)
      throw e
    }
  }

  return { serialize, deserialize }
}

export {
  assetsApi,
  serializeAssets,
  serializeAsset,
  deserializeAssets,
} from './assets-serialization.js'

/**
 * It creates a domain serialization target to UI wallet processes.
 * @returns {{serialize: (payload: object) => string, deserialize: (payload: string) => object}}
 */
export const createUIDomainSerialization = ({ getStoredAssets, proxyFunction }) => {
  assert(getStoredAssets, 'getStoredAssets is required')
  assert(proxyFunction, 'proxyFunction is required')
  return createDomainSerialization({
    excludeSerialization: { accountstate: true },
    serializeAsset: ({ name }) => {
      const errorMessage = `UI cannot serialize asset ${name}`
      throw new Error(errorMessage)
    },

    // Backend => UI. create the proxied light asset
    deserializeAsset: (assetPayload) => {
      const storedAssets = getStoredAssets()
      const assetsList = deserializeAssets([assetPayload], storedAssets, proxyFunction)
      return assetsList[0]
    },

    deserializeAssets: (assetsPayload) => {
      const storedAssets = getStoredAssets()
      return deserializeAssets(assetsPayload, storedAssets, proxyFunction)
    },
  })
}

/**
 * It creates a domain serialization targeted to backend wallet processes
 * @returns {{serialize: (payload: object) => string, deserialize: (payload: string) => object}}
 */
export const createBackendDomainSerialization = () => {
  return createDomainSerialization({
    serializeAsset,
    deserializeAsset: ({ name }) => {
      const errorMessage = `Backend cannot deserialize asset ${name}`
      throw new Error(errorMessage)
    },
  })
}

export default createDomainSerialization
