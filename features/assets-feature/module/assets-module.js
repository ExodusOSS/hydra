import {
  createAssetRegistry,
  CT_DEFAULT_SERVER,
  CT_STATUS as STATUS,
  CT_UPDATEABLE_PROPERTIES,
} from '@exodus/assets'
import { keyBy, mapValues, partition, pick, pickBy } from '@exodus/basic-utils'
import lodash from 'lodash'
import assert from 'minimalistic-assert'

import {
  CT_DATA_KEY,
  CT_FETCH_CACHE_EXPIRY,
  CT_TIMESTAMP_KEY,
  CT_UPDATE_INTERVAL,
} from './constants.js'
import { getAssetFromAssetId, getFetchErrorMessage, isDisabledCustomToken } from './utils.js'
import createFetchival from '@exodus/fetch/create-fetchival'

const { get, isEmpty, once } = lodash

const FILTERED_FIELDS = [
  'assetId',
  'baseAssetName',
  'displayName',
  'displayTicker',
  'gradientColors',
  'gradientCoords',
  'icon', // there is no icon field in built in assets, but there may be for custom tokens (TODO?)
  'isBuiltIn',
  'isCustomToken',
  'lifecycleStatus',
  'name',
  'primaryColor',
  'properName',
  'properTicker',
  'ticker',
]

const filterBuiltInProps = (asset) => ({ ...pick(asset, FILTERED_FIELDS), assetName: asset.name })

const getFetchCacheKey = (baseAssetName, assetId) => `${assetId}-${baseAssetName}`

const _isDisabledCustomToken = (token) => token.lifecycleStatus === STATUS.DISABLED

const normalizeToken = (token) => ({
  ...token,
  name: token.name || token.assetName,
  displayName: token.displayName || token.properName, // eslint-disable-line @exodus/hydra/no-asset-proper
  displayTicker: token.displayTicker || token.properTicker, // eslint-disable-line @exodus/hydra/no-asset-proper
})

const initialAssetRegistry = {
  getAsset: (assetName) => {
    try {
      throw new Error(`accessing asset ${assetName} too early`)
    } catch (e) {
      console.warn(e.message, e.stack)
    }
  },
  getAssets: () => {
    try {
      throw new Error(`accessing assets too early`)
    } catch (e) {
      console.warn(e.message, e.stack)
    }

    return {}
  },
}

export class AssetsModule {
  #registry
  #storage
  #fetchCache
  #config
  #customTokensServerUrl
  #updateableProps
  #iconsStorage
  #validateCustomToken
  #assetPlugins
  #combinedAssetsList
  #storageDataKey
  #storageTimestampKey
  #customTokenUpdateInterval
  #fetchCacheExpiry
  #assetsAtom
  #fetchival
  #logger

  constructor({
    storage,
    iconsStorage = { storeIcons: async () => {} },
    assetPlugins,
    assetsAtom,
    combinedAssetsList = [],
    validateCustomToken = () => true,
    config = {},
    fetch,
    logger,
  }) {
    this.#assetsAtom = assetsAtom
    this.#storage = storage
    this.#setRegistry(initialAssetRegistry)
    this.#assetPlugins = assetPlugins
    this.#combinedAssetsList = combinedAssetsList
    this.#fetchCache = {}
    this.#config = config
    this.#customTokensServerUrl = config.customTokensServerUrl || CT_DEFAULT_SERVER
    this.#updateableProps = [...CT_UPDATEABLE_PROPERTIES, 'version']
    this.#iconsStorage = iconsStorage
    this.#validateCustomToken = validateCustomToken
    this.#storageDataKey = config.storageDataKey || CT_DATA_KEY
    this.#storageTimestampKey = config.storageTimestampKey || CT_TIMESTAMP_KEY
    this.#customTokenUpdateInterval = config.customTokenUpdateInterval || CT_UPDATE_INTERVAL
    this.#fetchCacheExpiry = config.fetchCacheExpiry ?? CT_FETCH_CACHE_EXPIRY
    this.#fetchival = createFetchival({ fetch })
    this.#logger = logger
  }

  #setRegistry = (registry) => {
    this.#registry = registry

    if (registry === initialAssetRegistry) {
      return
    }

    // we want this to happen asap before load and even before start
    this.#assetsAtom.set({
      value: { ...this.#registry.getAssets() },
      added: [],
      updated: [],
      disabled: [],
    })
  }

  initialize = ({ assetClientInterface }) => {
    // TODO: pass asset specific config to assets module in `config.assetsConfig`
    const { assetsConfig = {} } = this.#config
    const assetsList = Object.entries(this.#assetPlugins)
      .map(([name, assetPlugin]) => {
        const asset = assetPlugin.createAsset({ assetClientInterface, config: assetsConfig[name] })
        if (asset.name === name) return asset
        console.warn(`Incorrectly referenced supported asset ${name}. Expected ${asset.name}.`)
      })
      .filter(Boolean)
    this.#setRegistry(
      createAssetRegistry({
        supportedAssetsList: [...assetsList, ...this.#combinedAssetsList],
      })
    )
  }

  getAssets = () => this.#registry.getAssets()

  getAsset = (assetName) => this.#registry.getAsset(assetName)

  getTokenNames = (baseAssetName) => {
    assert(
      baseAssetName === this.getAsset(baseAssetName).baseAsset.name,
      'getTokenNames(): baseAssetName expected'
    )
    return this.#getAssetNamesBy(
      (otherAsset) =>
        otherAsset.baseAsset.name === baseAssetName && otherAsset.name !== baseAssetName
    )
  }

  getBaseAssetNames = () => this.#getAssetNamesBy((asset) => asset.baseAsset.name === asset.name)

  load = once(async () => {
    try {
      const storedTokens = await this.#readCustomTokens()
      const tokens = pickBy(storedTokens, ({ baseAssetName }) => {
        const baseAsset = this.getAsset(baseAssetName)
        return baseAsset.api?.hasFeature?.('customTokens')
      })

      // tokens may be:
      // 1. pure custom tokens from the CTR
      // 2. built-in tokens previously from the CTR which may or may not be available
      // 3. both of the above from a network that has feature flag customTokens === false
      // It is OK to add all of these to the assets registry
      const { added, updated } = this.#handleFetchedTokens(Object.values(tokens))
      this.#flushChanges({ added, updated })
    } catch (e) {
      this.#logger.log('error reading custom tokens from storage:', e)
    }
  })

  // Custom tokens API

  fetchToken = async (assetId, baseAssetName) => {
    this.#assertSupportsCustomTokens(baseAssetName)

    const asset = this.#getAssetFromAssetId(assetId, baseAssetName)
    if (asset) {
      // either built-in asset (isBuiltIn === true) or previously added custom token (isCustomToken === true)
      return filterBuiltInProps(asset)
    }

    const key = getFetchCacheKey(baseAssetName, assetId)
    const cache = this.#getCache(key)
    if (cache?.cachedError) throw cache.cachedError
    if (cache) return cache

    const fetchTokenAndCacheError = async () => {
      try {
        return await this.#fetch(`networks/${baseAssetName}`, { assetId }, 'token')
      } catch (err) {
        if (err.message !== 'Too Many Requests') {
          this.#setCache(key, { cachedError: err })
        }

        throw err
      }
    }

    const _token = await fetchTokenAndCacheError()
    if (!this.#validateCustomToken(_token)) {
      this.#logger.warn('Invalid Custom Token schema')
      const err = new Error('Token did not pass validation')
      this.#setCache(key, { cachedError: err })
      throw err
    }

    const token = normalizeToken(_token)

    try {
      await this.#iconsStorage.storeIcons([token])
    } catch (err) {
      this.#logger.warn(`An error occurred while decoding icon for ${assetId}`, err.message)
    }

    this.#setCache(key, token)
    return this.#getCache(key)
  }

  addToken = async (assetId, baseAssetName) => {
    this.#assertCustomTokensStorageSupported()
    this.#assertSupportsCustomTokens(baseAssetName)

    try {
      const token = await this.fetchToken(assetId, baseAssetName)
      const { asset, isAdded } = this.#handleFetchedToken(token)

      if (isAdded) {
        await this.#storeCustomTokens([token])
        this.#flushChanges({ added: [asset] })
      } else {
        this.#flushChanges({ updated: [asset] })
      }

      return asset
    } catch (err) {
      this.#logger.warn(`Add custom token ${assetId} error on ${baseAssetName}`, err.message)
      throw err
    }
  }

  addTokens = async ({
    assetIds,
    baseAssetName,
    allowedStatusList = [STATUS.VERIFIED, STATUS.CURATED, STATUS.UNVERIFIED],
  }) => {
    this.#assertCustomTokensStorageSupported()
    this.#assertSupportsCustomTokens(baseAssetName)

    const tokens = await Promise.all(
      assetIds.map(async (assetId) => {
        try {
          return await this.fetchToken(assetId, baseAssetName)
        } catch (err) {
          this.#logger.warn('fetch custom tokens error:', err.message)
        }
      })
    )
    const filtered = tokens.filter((token) => {
      if (!token) return false
      const asset = this.getAsset(token.name)
      return (
        asset?.isBuiltIn ||
        asset?.isCustomToken || // already present custom token
        allowedStatusList.includes(token.lifecycleStatus) // new custom token from registry
      )
    })

    if (filtered.length === 0) return []

    const { fetchedAndHandledTokens, added, updated } = this.#handleFetchedTokens(filtered)

    if (fetchedAndHandledTokens.length > 0) {
      await this.#storeCustomTokens(fetchedAndHandledTokens)
    }

    this.#flushChanges({ added, updated })

    return [...added, ...updated]
  }

  addRemoteTokens = async ({ tokenNames }) => {
    this.#assertCustomTokensStorageSupported()

    const assets = this.getAssets()
    const [tokenNamesToUpdate, tokenNamesToFetch] = partition(
      tokenNames,
      (tokenName) => !!assets[tokenName]
    )

    const fetchedTokens =
      tokenNamesToFetch.length > 0
        ? await this.#fetch('tokens', { tokenNames: tokenNamesToFetch }, 'tokens')
        : []

    const validTokens = fetchedTokens.filter(this.#validateCustomToken).map(normalizeToken)
    if (validTokens.length !== fetchedTokens.length)
      this.#logger.warn('Invalid Custom Token schema')

    const tokens = tokenNamesToUpdate.map((tokenName) => assets[tokenName])

    validTokens.forEach((token) => {
      // replace fetched CT with existing built-in token if found by assetId
      const asset = token.assetId && this.#getAssetFromAssetId(token.assetId, token.baseAssetName)
      tokens.push(asset ?? token)
    })

    if (isEmpty(tokens)) return

    const { fetchedAndHandledTokens, added, updated } = this.#handleFetchedTokens(tokens)

    if (fetchedAndHandledTokens.length > 0) {
      await this.#storeCustomTokens(fetchedAndHandledTokens)
      await this.#iconsStorage.storeIcons(fetchedAndHandledTokens)
    }

    this.#flushChanges({ added, updated })
  }

  updateTokens = async () => {
    this.#assertCustomTokensStorageSupported()

    const doUpdate = await this.#isNextUpdateDate()
    if (!doUpdate) return

    await this.#setLastUpdateDate() // update the timestamp in storage even if no updates are performed
    const versionedAssetNames = await this.#getVersionedAssetNames()
    const updatableAssetNames = versionedAssetNames.filter(({ assetName }) => {
      const asset = this.getAsset(assetName)
      return !asset?.isBuiltIn && asset?.baseAsset.api?.hasFeature?.('customTokens')
    })
    if (updatableAssetNames.length === 0) return

    const tokens = await this.#fetchUpdates(updatableAssetNames)
    if (tokens.length === 0) return

    await this.#updateStoredCustomTokens(tokens)

    // determine assets that are newly disabled before updating the #registry
    const disabled = tokens.filter(
      (token) => _isDisabledCustomToken(token) && !isDisabledCustomToken(this.getAsset(token.name))
    )
    const updatedAssets = tokens.map(this.#registry.updateCustomToken)

    this.#flushChanges({ updated: updatedAssets, disabled })
  }

  searchTokens = async ({ baseAssetName, lifecycleStatus, query, excludeTags = ['offensive'] }) => {
    assert(
      !baseAssetName || typeof baseAssetName === 'string' || Array.isArray(baseAssetName),
      'searchTokens(): baseAssetName must be a string or an array if supplied'
    )

    let baseAssetNames
    if (Array.isArray(baseAssetName)) {
      baseAssetName.every((assetName) => this.#assertSupportsCustomTokens(assetName))
      baseAssetNames = baseAssetName
    } else if (baseAssetName) {
      this.#assertSupportsCustomTokens(baseAssetName)
      baseAssetNames = [baseAssetName]
    } else {
      baseAssetNames = this.#getCustomTokensNetworkNames()
    }

    const tokens = await this.#fetch(
      'search',
      { baseAssetName: baseAssetNames, lifecycleStatus, query, excludeTags },
      'tokens'
    )
    const validTokens = tokens.filter(this.#validateCustomToken)

    if (validTokens.length !== tokens.length) this.#logger.warn('Invalid Custom Token schema')

    return validTokens.map((token) => {
      const asset = this.#getAssetFromAssetId(token.assetId, token.baseAssetName)
      return asset ? filterBuiltInProps(asset) : normalizeToken(token)
    })
  }

  #getCustomTokensNetworkNames = () =>
    this.getBaseAssetNames().filter((assetName) =>
      this.getAsset(assetName).api?.hasFeature?.('customTokens')
    )

  #fetchUpdates = async (assetVersions) => {
    const updatedTokens = await this.#fetch('updates', assetVersions, 'tokens')
    const validatedTokens = updatedTokens.filter(this.#validateCustomToken).map(normalizeToken)
    if (validatedTokens.length !== updatedTokens.length) {
      this.#logger.warn('Invalid Custom Token schema')
    }

    await this.#iconsStorage.storeIcons(validatedTokens)
    return validatedTokens
  }

  #getAssetFromAssetId = (assetId, baseAssetName) =>
    getAssetFromAssetId(this.getAssets(), assetId, baseAssetName)

  #getAssetNamesBy = (filter) =>
    Object.keys(this.getAssets()).filter((assetName) => filter(this.getAsset(assetName)))

  #setCache = (key, value) => {
    this.#fetchCache[key] = { value, expiry: Date.now() + this.#fetchCacheExpiry }
  }

  #getCache = (key) => {
    const item = this.#fetchCache[key]
    return item?.value && Date.now() < item.expiry ? item.value : null
  }

  #flushChanges = ({ added = [], updated = [], disabled = [] } = {}) => {
    if (added.length + updated.length + disabled.length === 0) {
      return
    }

    this.#assetsAtom.set({
      value: { ...this.#registry.getAssets() },
      added,
      updated,
      disabled,
    })
  }

  #fetch = async (endpoint, body, resultPath) => {
    try {
      const testDataParam = this.#config.fetchTestValues ? '?test=true' : ''
      const res = await this.#fetchival(this.#customTokensServerUrl)(
        `${endpoint}${testDataParam}`
      ).post(body)

      if (res.status !== 'OK')
        throw new Error(`Custom tokens registry ${endpoint} ${res.status} ${res.message}`)

      return get(res, resultPath)
    } catch (error) {
      throw new Error(await getFetchErrorMessage(error))
    }
  }

  #handleFetchedToken = (token) => {
    const asset = this.getAsset(token.name)
    if (asset) return { asset, isAdded: false }

    const { name } = this.#registry.addCustomToken(token) // add to registry
    this.#logger.log('Custom token added:', name)
    return { asset: this.getAsset(name), isAdded: true }
  }

  #handleFetchedTokens = (tokens) => {
    const fetchedAndHandledTokens = []
    const added = []
    const updated = []
    for (const token of tokens) {
      try {
        const { asset, isAdded } = this.#handleFetchedToken(token)
        if (isAdded) {
          added.push(asset)
          fetchedAndHandledTokens.push(token)
        } else {
          updated.push(asset)
        }
      } catch (err) {
        this.#logger.warn('Handle fetched custom tokens error:', err.message)
      }
    }

    return { fetchedAndHandledTokens, added, updated }
  }

  #assertSupportsCustomTokens = (baseAssetName) => {
    const baseAsset = this.getAsset(baseAssetName)
    if (!baseAsset?.api?.hasFeature('customTokens')) {
      const reason = `BUG: network ${baseAsset?.name} does not support custom tokens.`
      this.#logger.warn(reason)
      throw new Error(reason)
    }
  }

  // Custom Tokens storage

  #assertCustomTokensStorageSupported = () => {
    if (!this.#storage) {
      throw new Error('Custom Tokens storage is not supported')
    }
  }

  #readCustomTokens = async () => {
    if (!this.#storage) return []

    const tokens = await this.#storage.get(this.#storageDataKey)
    return mapValues(tokens, normalizeToken)
  }

  #storeCustomTokens = async (tokens) => {
    const _tokens = await this.#readCustomTokens()
    await this.#storage.set(this.#storageDataKey, { ..._tokens, ...keyBy(tokens, 'name') })
  }

  #updateStoredCustomTokens = async (tokens) => {
    const _tokens = await this.#readCustomTokens()
    // safer not to overwrite everything
    const updates = tokens.map((token) => ({
      ..._tokens[token.name],
      ...pick(token, this.#updateableProps), // like state updates, safer not to overwrite everything in storage
    }))
    await this.#storage.set(this.#storageDataKey, { ..._tokens, ...keyBy(updates, 'name') })
  }

  #getVersionedAssetNames = async () => {
    const tokens = await this.#readCustomTokens()
    const filtered = Object.values(tokens).filter(({ name }) => !this.getAsset(name)?.isBuiltIn)
    return filtered.map(({ assetName, version }) => ({ assetName, version }))
  }

  #setLastUpdateDate = async () => {
    await this.#storage.set(this.#storageTimestampKey, Date.now())
  }

  #isNextUpdateDate = async () => {
    const lastUpdateDate = await this.#storage.get(this.#storageTimestampKey)
    return !lastUpdateDate || Date.now() - lastUpdateDate > this.#customTokenUpdateInterval
  }

  clear = async () =>
    this.#storage &&
    Promise.all([
      // should we also delete icons?
      this.#storage.delete(this.#storageDataKey),
      this.#storage.delete(this.#storageTimestampKey),
    ])
}

export default AssetsModule
