import {
  createAssetRegistry,
  CT_DEFAULT_SERVER,
  CT_STATUS as STATUS,
  CT_UPDATEABLE_PROPERTIES,
} from '@exodus/assets'
import { keyBy, mapValues, partition, pickBy, difference, pick } from '@exodus/basic-utils'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import assert from 'minimalistic-assert'
import { memoizeLruCache } from '@exodus/asset-lib'
import {
  CT_DATA_KEY,
  CT_FETCH_CACHE_EXPIRY,
  CT_TIMESTAMP_KEY,
  CT_UPDATE_INTERVAL,
  CTR_TOKENS_LIMIT,
} from './constants.js'
import {
  filterBuiltInProps,
  getAssetFromAssetId,
  getFetchErrorMessage,
  isDisabledCustomToken,
} from './utils.js'
import createFetchival from '@exodus/fetch/create-fetchival'
import { validateCustomToken } from '@exodus/asset-schema-validation'
import makeConcurrent from 'make-concurrent'
import oldToNewStyleTokenNames from '@exodus/asset-legacy-token-name-mapping'
import {
  createDynamicCombinedAssetDefinitions,
  shouldTokenJoinCombinedAsset,
  findDynamicCombinedAssetForToken,
  getDynamicCombinedAssetKey,
} from './dynamic-combined-assets.js'

const { get, isEmpty, once, uniq, chunk } = lodash

const getFetchCacheKey = (baseAssetName, assetId) => `${assetId}-${baseAssetName}`

const _isDisabledCustomToken = (token) => token.lifecycleStatus === STATUS.DISABLED

const normalizeToken = (token) => ({
  ...token,
  name: token.name || token.assetName,
  displayName: token.displayName || token.properName, // oxlint-disable-line @exodus/oxlint-plugin-hydra/no-asset-proper
  displayTicker: token.displayTicker || token.properTicker, // oxlint-disable-line @exodus/oxlint-plugin-hydra/no-asset-proper
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
  #shouldValidateCustomToken
  #assetPlugins
  #combinedAssetsList
  #storageDataKey
  #storageTimestampKey
  #customTokenUpdateInterval
  #fetchCacheExpiry
  #assetsAtom
  #fetchival
  #logger
  #invalidTokenNames
  #useDynamicCombinedAssets
  #dynamicCombinedAssetOverrides

  constructor({
    storage,
    iconsStorage = {
      storeIcons: async () => {},
      unzipIcon: (icon) => {
        return icon
      },
    },
    assetPlugins,
    assetsAtom,
    combinedAssetsList = [],
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
    this.#shouldValidateCustomToken = config.shouldValidateCustomToken ?? true
    this.#storageDataKey = config.storageDataKey || CT_DATA_KEY
    this.#storageTimestampKey = config.storageTimestampKey || CT_TIMESTAMP_KEY
    this.#customTokenUpdateInterval = config.customTokenUpdateInterval || CT_UPDATE_INTERVAL
    this.#fetchCacheExpiry = config.fetchCacheExpiry ?? CT_FETCH_CACHE_EXPIRY
    this.#fetchival = createFetchival({ fetch })
    this.#logger = logger
    this.#invalidTokenNames = new Set([
      ...Object.keys(oldToNewStyleTokenNames).filter(
        (name) => name !== oldToNewStyleTokenNames[name]
      ),
      ...(config.invalidTokenNames || []),
    ])
    this.#useDynamicCombinedAssets = config.useDynamicCombinedAssets ?? false
    this.#dynamicCombinedAssetOverrides =
      config.dynamicCombinedAssetOverrides ?? Object.create(null)
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

  initialize = once(({ assetClientInterface, assetsConfig }) => {
    const { assetsConfig: defaultAssetsConfig = Object.create(null) } = this.#config
    const assetsList = Object.entries(this.#assetPlugins)
      .map(([name, assetPlugin]) => {
        let asset

        try {
          const config = { ...defaultAssetsConfig[name], ...assetsConfig?.[name]?.config }
          asset = assetPlugin.createAsset({ assetClientInterface, config })
        } catch (e) {
          this.#logger.error(
            `failed to createAsset ${name} using custom assetsConfig: ${e.message}, using default configuration`,
            e
          )

          asset = assetPlugin.createAsset({
            assetClientInterface,
            config: defaultAssetsConfig[name],
          })
        }

        if (asset.name === name) return asset
        console.warn(`Incorrectly referenced supported asset ${name}. Expected ${asset.name}.`)
      })
      .filter(Boolean)

    const combinedAssets = this.#useDynamicCombinedAssets ? [] : this.#combinedAssetsList

    this.#setRegistry(
      createAssetRegistry({
        supportedAssetsList: [...assetsList, ...combinedAssets],
      })
    )

    // Only flush static combined assets - dynamic ones are flushed in load()
    if (!this.#useDynamicCombinedAssets) {
      const allCombined = Object.values(this.#registry.getAssets()).filter((a) => a.isCombined)
      if (allCombined.length > 0) {
        this.#flushChanges({ added: allCombined })
      }
    }
  })

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
    const allAdded = []
    const allUpdated = []

    try {
      const storedTokens = await this.#readCustomTokens()

      const tokens = pickBy(storedTokens, ({ baseAssetName }) => {
        const baseAsset = this.getAsset(baseAssetName)
        return baseAsset?.api?.features?.customTokens
      })

      // tokens may be:
      // 1. pure custom tokens from the CTR
      // 2. built-in tokens previously from the CTR which may or may not be available
      // 3. both of the above from a network that has feature flag customTokens === false
      // It is OK to add all of these to the assets registry
      const { added, updated } = this.#handleFetchedTokens(Object.values(tokens))
      allAdded.push(...added)
      allUpdated.push(...updated)
    } catch (e) {
      this.#logger.error('error reading custom tokens from storage: ' + e.message, e)
    }

    if (this.#useDynamicCombinedAssets) {
      try {
        const { added, updated } = this.#createDynamicCombinedAssets()
        allAdded.push(...added)
        allUpdated.push(...updated)
      } catch (e) {
        this.#logger.error('error creating dynamic combined assets: ' + e.message, e)
      }
    }

    this.#flushChanges({ added: allAdded, updated: allUpdated })
  })

  #createDynamicCombinedAssets = () => {
    const allAssets = this.getAssets()
    const definitions = createDynamicCombinedAssetDefinitions(allAssets, {
      overrides: this.#dynamicCombinedAssetOverrides,
    })

    const newlyCreatedNames = []
    for (const definition of definitions) {
      const existingCombined = this.getAsset(definition.name)
      if (existingCombined) continue

      this.#registry.addCombinedAsset(definition)
      newlyCreatedNames.push(definition.name)
    }

    if (newlyCreatedNames.length > 0) {
      const newCombinedAssets = newlyCreatedNames.map((name) => this.getAsset(name)).filter(Boolean)
      const childAssetNames = new Set(newCombinedAssets.flatMap((c) => c.combinedAssetNames))
      const childAssets = [...childAssetNames].map((name) => this.getAsset(name)).filter(Boolean)
      return { added: newCombinedAssets, updated: childAssets }
    }

    return { added: [], updated: [] }
  }

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
    if (!this.#isValidCustomToken(_token)) {
      const err = new Error('Token did not pass validation')
      this.#setCache(key, { cachedError: err })
      throw err
    }

    const token = normalizeToken(_token)

    await this.#storeIcons([token])

    this.#setCache(key, token)
    return this.#getCache(key)
  }

  #fetchTokens = async (assetDescriptors) => {
    for (const { baseAssetName } of assetDescriptors) {
      this.#assertSupportsCustomTokens(baseAssetName)
    }

    const [builtInDescriptors, customTokensDescriptors] = partition(
      assetDescriptors,
      ({ assetId, baseAssetName }) => !!this.#getAssetFromAssetId(assetId, baseAssetName)
    )

    const getBuiltInDefinitions = (descriptors) =>
      descriptors.map(({ assetId, baseAssetName }) =>
        filterBuiltInProps(this.#getAssetFromAssetId(assetId, baseAssetName))
      )

    const getCustomTokensDefinitions = async (descriptors) => {
      const _tokens = await this.#fetch(
        `tokens`,
        { assetIds: descriptors, lifecycleStatus: ['c', 'v', 'u'] },
        'tokens'
      )

      const validTokens = _tokens.filter(this.#isValidCustomToken)

      const tokens = validTokens.map((token) => normalizeToken(token))

      await this.#storeIcons(tokens)

      for (const token of tokens) {
        const key = getFetchCacheKey(token.baseAssetName, token.assetId)
        this.#setCache(key, token)
      }

      return tokens
    }

    const builtInTokens = getBuiltInDefinitions(builtInDescriptors)
    const customTokens = await getCustomTokensDefinitions(customTokensDescriptors)

    return { builtInTokens, customTokens }
  }

  fetchTokens = async (assetDescriptors) => {
    const pages = chunk(assetDescriptors, CTR_TOKENS_LIMIT)

    const builtInTokens = []
    const customTokens = []
    for (const page of pages) {
      const tokens = await this.#fetchTokens(page)
      builtInTokens.push(...tokens.builtInTokens)
      customTokens.push(...tokens.customTokens)
    }

    const builtInAssets = builtInTokens.map(({ name }) => this.getAsset(name))
    const customTokenAssets = customTokens.map((definition) => {
      const baseAsset = this.getAsset(definition.baseAssetName)
      return baseAsset.api.createToken(definition)
    })

    return [...builtInAssets, ...customTokenAssets]
  }

  addToken = async (assetId, baseAssetName) => {
    this.#assertCustomTokensStorageSupported()
    this.#assertSupportsCustomTokens(baseAssetName)

    try {
      const token = await this.fetchToken(assetId, baseAssetName)
      const { asset, isAdded, combinedUpdates, combinedCreated } = this.#handleFetchedToken(token)
      const updated = combinedUpdates.map(this.getAsset)
      const added = isAdded ? [asset, ...combinedCreated] : combinedCreated

      if (isAdded) {
        await this.#storeCustomTokens([token])
      }

      this.#flushChanges({ added, updated: isAdded ? updated : [asset, ...updated] })

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

  addRemoteTokens = async ({ tokenNames, allowedStatusList }) => {
    this.#assertCustomTokensStorageSupported()
    assert(Array.isArray(tokenNames), 'addRemoteTokens: expected array')
    assert(
      !allowedStatusList || Array.isArray(allowedStatusList),
      'addRemoteTokens: expected `allowedStatusList` to be an array'
    )

    const assets = this.getAssets()
    const validNames = tokenNames.filter((name) => this.#validCustomTokenName({ name }))
    const [tokenNamesToUpdate, tokenNamesToFetch] = partition(
      validNames,
      (tokenName) => !!assets[tokenName]
    )

    const tokens = tokenNamesToUpdate.map((tokenName) => assets[tokenName])

    if (tokenNamesToFetch.length > 0) {
      const fetchedTokens = await this.#fetchTokensByNames({
        tokenNames: tokenNamesToFetch,
        allowedStatusList,
      })
      const validTokens = fetchedTokens.filter(this.#isValidCustomToken).map(normalizeToken)

      if (validTokens && validTokens.length !== fetchedTokens.length) {
        this.#logger.warn('Invalid Custom Token schema')
      }

      validTokens.forEach((token) => {
        // replace fetched CT with existing built-in token if found by assetId
        const asset = token.assetId && this.#getAssetFromAssetId(token.assetId, token.baseAssetName)
        tokens.push(asset || token)
      })
    }

    if (isEmpty(tokens)) return

    const { fetchedAndHandledTokens, added, updated } = this.#handleFetchedTokens(tokens)

    if (fetchedAndHandledTokens.length > 0) {
      await this.#storeCustomTokens(fetchedAndHandledTokens)
      await this.#storeIcons(fetchedAndHandledTokens)
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
      return !asset?.isBuiltIn && asset?.baseAsset.api?.features?.customTokens
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
    const parentNames = uniq(tokens.flatMap(this.#handleCombinedParents))
    updatedAssets.push(...parentNames.map(this.getAsset))

    this.#flushChanges({ updated: updatedAssets, disabled })
  }

  searchTokens = async ({
    baseAssetName,
    lifecycleStatus,
    query,
    tags,
    excludeTags = ['offensive'],
    pageNumber,
    pageSize,
  }) => {
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
      {
        baseAssetName: baseAssetNames,
        lifecycleStatus,
        query,
        tags,
        excludeTags,
        pageNumber,
        pageSize,
      },
      'tokens'
    )
    const validTokens = tokens.filter(this.#isValidCustomToken)

    if (validTokens.length !== tokens.length) this.#logger.warn('Invalid Custom Token schema')

    return validTokens.map((token) => {
      const asset = this.#getAssetFromAssetId(token.assetId, token.baseAssetName)
      return asset ? filterBuiltInProps(asset) : normalizeToken(token)
    })
  }

  #getCustomTokensNetworkNames = () =>
    this.getBaseAssetNames().filter(
      (assetName) => this.getAsset(assetName).api?.features?.customTokens
    )

  #fetchTokensByNames = async ({ tokenNames, allowedStatusList }) => {
    const pages = chunk(tokenNames, CTR_TOKENS_LIMIT)

    const pagePromises = pages.map(async (page) => {
      const body = {
        tokenNames: page,
        ...(allowedStatusList && { lifecycleStatus: allowedStatusList }),
      }

      return this.#fetch('tokens', body, 'tokens')
    })

    const pagesResults = await Promise.all(pagePromises)
    return pagesResults.flat()
  }

  #fetchUpdates = async (assetVersions) => {
    const updatedTokens = await this.#fetch('updates', assetVersions, 'tokens')
    const validatedTokens = updatedTokens.filter(this.#isValidCustomToken).map(normalizeToken)
    if (validatedTokens.length !== updatedTokens.length) {
      this.#logger.warn('Invalid Custom Token schema')
    }

    await this.#storeIcons(validatedTokens)

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

      if (res.status !== 'OK') {
        throw new Error(`Custom tokens registry ${endpoint} ${res.status} ${res.message}`)
      }

      return get(res, resultPath)
    } catch (error) {
      throw new Error(await getFetchErrorMessage(error))
    }
  }

  #handleCombinedParents = ({ name, parents }) => {
    if (this.#useDynamicCombinedAssets) {
      return []
    }

    if (!parents) return []
    assert(Array.isArray(parents), 'Array expected')

    const currentParents = this.#getAssetNamesBy(
      (asset) => asset.isCombined && asset.combinedAssetNames.includes(name)
    )
    const updatedCombinedAssetNames = []

    const removedParents = difference(currentParents, parents)
    removedParents.forEach((parent) => {
      this.#registry.updateCombinedAsset(parent, { removeMembers: [name] })
      updatedCombinedAssetNames.push(parent)
    })

    const addedParents = difference(parents, currentParents)
    addedParents.forEach((parent) => {
      const asset = this.getAsset(parent)
      if (!asset || !asset.isCombined) return

      this.#registry.updateCombinedAsset(parent, { addMembers: [name] })
      updatedCombinedAssetNames.push(parent)
    })

    return uniq(updatedCombinedAssetNames)
  }

  #handleDynamicCombinedAssetUpdate = (token) => {
    if (!this.#useDynamicCombinedAssets) return { updated: [], created: [], members: [] }
    if (!shouldTokenJoinCombinedAsset(token)) return { updated: [], created: [], members: [] }

    const allAssets = this.getAssets()
    const combinedAssets = Object.values(allAssets).filter((a) => a.isCombined)
    const options = { assets: allAssets, overrides: this.#dynamicCombinedAssetOverrides }
    const matchingCombined = findDynamicCombinedAssetForToken(token, combinedAssets, options)

    if (matchingCombined) {
      if (!matchingCombined.combinedAssetNames.includes(token.name)) {
        this.#registry.updateCombinedAsset(matchingCombined.name, { addMembers: [token.name] })
        return { updated: [matchingCombined.name], created: [], members: [] }
      }
    } else {
      const tokenKey = getDynamicCombinedAssetKey(token, options)
      if (!tokenKey) return { updated: [], created: [], members: [] }
      const matchingAssets = Object.values(allAssets).filter(
        (a) =>
          !a.isCombined &&
          getDynamicCombinedAssetKey(a, options) === tokenKey &&
          shouldTokenJoinCombinedAsset(a)
      )

      if (matchingAssets.length >= 2) {
        const definitions = createDynamicCombinedAssetDefinitions(matchingAssets, options)
        if (definitions.length > 0) {
          const newCombined = this.#registry.addCombinedAsset(definitions[0])
          const memberNames = matchingAssets.map((a) => a.name).filter((n) => n !== token.name)
          return { updated: [], created: [newCombined], members: memberNames }
        }
      }
    }

    return { updated: [], created: [], members: [] }
  }

  #handleFetchedToken = (token) => {
    const asset = this.getAsset(token.name)
    if (asset) {
      const dynamicResult = this.#handleDynamicCombinedAssetUpdate(asset)
      return {
        asset,
        isAdded: false,
        combinedUpdates: dynamicResult.updated,
        combinedCreated: dynamicResult.created,
        combinedMembers: dynamicResult.members,
      }
    }

    const { name } = this.#registry.addCustomToken(token)
    const staticUpdates = this.#handleCombinedParents(token)
    const dynamicResult = this.#handleDynamicCombinedAssetUpdate(this.getAsset(name))
    const combinedUpdates = [...staticUpdates, ...dynamicResult.updated]

    this.#logger.log('Custom token added:', name)
    return {
      asset: this.getAsset(name),
      isAdded: true,
      combinedUpdates,
      combinedCreated: dynamicResult.created,
      combinedMembers: dynamicResult.members,
    }
  }

  #handleFetchedTokens = (tokens) => {
    const fetchedAndHandledTokens = []
    const added = []
    const updated = []
    const combinedUpdateNames = []
    const combinedCreated = []
    const combinedMemberNames = []

    for (const token of tokens) {
      try {
        const result = this.#handleFetchedToken(token)

        if (result.isAdded) {
          added.push(result.asset)
          fetchedAndHandledTokens.push(token)
        } else {
          updated.push(result.asset)
        }

        if (result.combinedUpdates.length > 0) {
          combinedUpdateNames.push(...result.combinedUpdates)
        }

        if (result.combinedCreated.length > 0) {
          combinedCreated.push(...result.combinedCreated)
        }

        if (result.combinedMembers.length > 0) {
          combinedMemberNames.push(...result.combinedMembers)
        }
      } catch (err) {
        this.#logger.error('Handle fetched custom tokens error: ' + err.message, err)
      }
    }

    const createdNames = new Set(combinedCreated.map((a) => a.name))
    const dedupedUpdateNames = uniq(combinedUpdateNames).filter((name) => !createdNames.has(name))
    const dedupedMemberNames = uniq(combinedMemberNames).filter((name) => !createdNames.has(name))
    updated.push(...dedupedUpdateNames.map(this.getAsset).filter(Boolean))
    updated.push(...dedupedMemberNames.map(this.getAsset).filter(Boolean))
    added.push(...combinedCreated.map((a) => this.getAsset(a.name)).filter(Boolean))

    return { fetchedAndHandledTokens, added, updated }
  }

  #fetchIconToken = memoizeLruCache(
    async (assetName) => {
      const tokens = await this.#fetchTokensByNames({
        tokenNames: [assetName],
        allowedStatusList: ['c', 'v', 'u'],
      })
      return tokens[0]
    },
    (assetName) => assetName,
    { max: 100 }
  )

  getIcon = async (assetName) => {
    assert(assetName, 'assetName is required')

    const asset = await this.getAsset(assetName)
    if (asset) {
      try {
        const storedIcon = await this.#iconsStorage.getIcon(assetName)
        if (storedIcon) return storedIcon
      } catch (e) {
        this.#logger.warn(`Failed to read stored icon for ${assetName}. ${e.message}`, e)
      }

      if (asset.isBuiltIn) return
    }

    try {
      const token = await this.#fetchIconToken(assetName)
      if (!token?.icon) return
      if (asset) await this.#storeIcons([token])
      return this.#iconsStorage.unzipIcon(token.icon)
    } catch (e) {
      this.#logger.error(`Cannot load icon for ${assetName} from CTR. ${e.message}`, e)
    }
  }

  #storeIcons = async (tokens) => {
    try {
      if (tokens.length > 0) {
        await this.#iconsStorage.storeIcons(tokens)
      }
    } catch (err) {
      this.#logger.warn(
        `An error occurred while storing icons ${tokens.map((t) => t.name).join(',')}`,
        err
      )
    }
  }

  #assertSupportsCustomTokens = (baseAssetName) => {
    const baseAsset = this.getAsset(baseAssetName)
    if (!baseAsset?.api?.features?.customTokens) {
      const reason = `BUG: network ${baseAsset?.name} does not support custom tokens.`
      this.#logger.warn(reason)
      throw new Error(reason)
    }
  }

  #validCustomTokenName = ({ name }) => !this.#invalidTokenNames.has(name)

  // Custom Tokens storage

  #assertCustomTokensStorageSupported = () => {
    if (!this.#storage) {
      throw new Error('Custom Tokens storage is not supported')
    }
  }

  #readCustomTokens = async () => {
    if (!this.#storage) return []

    const tokens = await this.#storage.get(this.#storageDataKey)
    const normalizedTokens = mapValues(tokens, normalizeToken)
    return pickBy(normalizedTokens, this.#validCustomTokenName)
  }

  #updateStoredCustomTokens = async (tokens) => {
    await this.#storeCustomTokens(tokens, true)
  }

  #storeCustomTokens = makeConcurrent(async (tokens, isUpdate) => {
    const _tokens = await this.#readCustomTokens()
    if (isUpdate) {
      // safer not to overwrite everything
      const updates = tokens.map((token) => ({
        ..._tokens[token.name],
        ...pick(token, this.#updateableProps), // like state updates, safer not to overwrite everything in storage
      }))
      await this.#storage.set(this.#storageDataKey, { ..._tokens, ...keyBy(updates, 'name') })
    } else {
      await this.#storage.set(this.#storageDataKey, { ..._tokens, ...keyBy(tokens, 'name') })
    }
  })

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

  #isValidCustomToken = (token) => {
    if (!this.#shouldValidateCustomToken) {
      return true
    }

    try {
      validateCustomToken(token)
      return true
    } catch (e) {
      this.#logger.warn(
        `Token ${token.name ?? token.assetName} did not pass validation: ${e.message}`
      )
      return false
    }
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
