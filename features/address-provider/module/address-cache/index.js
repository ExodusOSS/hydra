import { mapValues, set } from '@exodus/basic-utils'
import lodash from 'lodash'
import restrictConcurrency from 'make-concurrent'
import assert from 'minimalistic-assert'
import ms from 'ms'
import pDefer from 'p-defer'

import { diffCaches, getUnsyncedAddressesForPush, getCachePath } from './utils.js'

const { get, merge, once, throttle, zipObject } = lodash

const channelName = 'addressCache2'

const addressCacheChannel = {
  type: 'addressCache',
  channelName,
  syncStateKey: `sync:syncstate:${channelName}`,
  batchSize: 1000,
}

const emptyAtomState = {
  caches: Object.create(null),
  mismatches: Object.create(null),
}

class AddressCache {
  #channel = null
  #addressCacheAtom = null
  #logger = null
  #enabledWalletAccountsAtom = null
  #storage = null
  #cachesStorage = null
  #mismatchesStorage = null
  #loaded
  #config = null
  #atomInitialized = false
  #fusion = null
  #unsubscribe

  constructor({ logger, addressCacheAtom, fusion, enabledWalletAccountsAtom, storage, config }) {
    this.#addressCacheAtom = addressCacheAtom
    this.#logger = logger
    this.#enabledWalletAccountsAtom = enabledWalletAccountsAtom
    this.#storage = storage
    this.#mismatchesStorage = storage.namespace('mismatches')
    this.#cachesStorage = storage.namespace('caches')
    this.#loaded = pDefer()
    this.#config = config
    this.#fusion = fusion
  }

  #update = restrictConcurrency(async (addressCacheChanges, { fromSync } = Object.create(null)) => {
    await this.#loaded.promise
    const preState = await this.#addressCacheAtom.get()

    const { isDifferent, needsSync, diff } = diffCaches(
      preState.caches,
      addressCacheChanges.caches,
      fromSync
    )
    if (isDifferent) {
      const postState = merge(Object.create(null), preState, {
        ...addressCacheChanges,
        caches: diff, // diffCaches can modify the cache
      })

      await this.#addressCacheAtom.set(postState)
      await this.#writeToDisk?.(postState)
    }

    if (!fromSync && needsSync) {
      this.#logger.debug('scheduled a push of address cache to fusion')
      this.#throttledUpdateFusion?.()
    }
  })

  /**
   * Schedule a push to fusion. This is throttled to avoid flooding the channel with messages.
   */
  #throttledUpdateFusion = throttle(
    restrictConcurrency(async () => {
      if (this.#config.noSync) return

      // Let's await for the channel to be synced down
      // so our addressCacheAtom is up to date
      const channel = await this.#getSyncedChannel()
      const currentCache = await this.#addressCacheAtom.get()

      // Get only unsynced addresses, so we don't push the whole cache every time
      const data = getUnsyncedAddressesForPush(currentCache.caches)

      // Also be nice and not push empty data to fusion
      if (Object.keys(data).length === 0) return

      this.#logger.debug('pushing address cache update to fusion', data)
      await channel.push({
        type: addressCacheChannel.type,
        data,
      })
    }),
    this.#config?.fusionPushDelay ?? ms('60s'),
    { leading: false, trailing: true }
  )

  #getSyncedChannel = async () => {
    await this.#channel.awaitProcessed()

    return this.#channel
  }

  awaitSynced = async () => {
    await this.#loaded.promise
    await this.#getSyncedChannel()
  }

  clear = async () => {
    this.#storage.clear()
    await this.#addressCacheAtom.set(Object.create(null))
  }

  load = async () => {
    if (this.#loaded.loaded) return
    if (this.#loaded.loading) return this.#loaded.promise
    this.#loaded.loading = true
    try {
      await this.#load()
      this.#loaded.resolve()
      this.#loaded.loaded = true
    } finally {
      this.#loaded.loading = false
    }
  }

  #initChannel = once(() => {
    this.#channel = this.#fusion.channel({
      ...addressCacheChannel,
      processBatch: async (batch) => {
        batch = batch.map(({ data }) => data)
        // each item:
        // {
        //   [walletAccount]: {
        //     [path]: address
        //   }
        // }

        const data = merge(...batch)
        const withSyncedFlag = mapValues(data, (cache, walletAccount) =>
          mapValues(cache, (address, path) => ({
            address,
            synced: true,
          }))
        )

        this.#logger.debug('received address cache update from fusion', withSyncedFlag)
        await this.#update({ caches: withSyncedFlag }, { fromSync: true })
      },
    })
  })

  #load = async () => {
    if (this.#config.disabled || this.#config.noStorage) {
      // intentionally only set the atom & not storage, as disabling is temporary
      await this.#addressCacheAtom.set(emptyAtomState)
      return
    }

    this.#initChannel()

    // awaits first run, then runs on changes in enabledWalletAccounts
    await new Promise((resolve) => {
      this.#unsubscribe = this.#enabledWalletAccountsAtom.observe((walletAccounts) => {
        this.#loadDataIntoAtom(Object.keys(walletAccounts)).then(resolve)
      })
    })
  }

  #loadDataIntoAtom = async (enabledWalletAccountsNames) => {
    const caches = zipObject(
      enabledWalletAccountsNames,
      await Promise.all(
        enabledWalletAccountsNames.map(
          async (walletAccount) =>
            (await this.#cachesStorage.get(walletAccount)) || Object.create(null)
        )
      )
    )
    const mismatches = (await this.#mismatchesStorage.get('data')) || Object.create(null)

    // don't overwrite any existing state on load from disk
    if (this.#atomInitialized) {
      const oldState = await this.#addressCacheAtom.get()
      await this.#addressCacheAtom.set(merge(Object.create(null), { caches, mismatches }, oldState))
    } else {
      await this.#addressCacheAtom.set({ caches, mismatches })
      this.#atomInitialized = true
    }

    // preferable way to do it, but it is broken
    // await this.#addressCacheAtom.set((oldState) => {
    //   return merge(Object.create(null), { caches, mismatches }, oldState)
    // }) // don't overwrite any existing state on load from disk
  }

  #writeToDisk = throttle(
    async (data) => {
      if (data.caches) {
        await Promise.all(
          Object.keys(data.caches).map((walletAccount) =>
            this.#cachesStorage.set(walletAccount, data.caches[walletAccount])
          )
        )
      }

      if (data.mismatches) {
        await this.#mismatchesStorage.set('data', data.mismatches)
      }
    },
    ms('10s'),
    { leading: false, trailing: true }
  )

  get = async ({ baseAssetName, walletAccountName, derivationPath }) => {
    assert(typeof walletAccountName === 'string', 'expected string "walletAccountName"')
    assert(typeof derivationPath === 'string', 'expected string "derivationPath"')
    assert(typeof baseAssetName === 'string', 'expected number "baseAssetName"')
    const addressCache = await this.#addressCacheAtom.get()

    const path = getCachePath({
      baseAssetName,
      walletAccountName,
      derivationPath,
    })

    return get(addressCache, ['caches', ...path])
  }

  getMismatches = async () => {
    const addressCache = await this.#addressCacheAtom.get()

    return get(addressCache, 'mismatches')
  }

  async set({ baseAssetName, walletAccountName, derivationPath, address }) {
    assert(typeof walletAccountName === 'string', 'expected string "walletAccountName"')
    assert(typeof derivationPath === 'string', 'expected string "derivationPath"')
    assert(typeof baseAssetName === 'string', 'expected number "baseAssetName"')
    assert(!!address, 'expected "address"')
    if (this.#config.disabled) return
    await this.#loaded.promise

    address = address.toString()
    const path = getCachePath({
      baseAssetName,
      walletAccountName,
      derivationPath,
    })

    const currentValue = await this.get({
      baseAssetName,
      walletAccountName,
      derivationPath,
    })

    const addressCacheChanges = Object.create(null)

    if (currentValue && currentValue.address) {
      const mismatch = currentValue.address.toString() !== address.toString()
      if (!mismatch) return

      this.#logger.info(
        'addressCache miss match!',
        baseAssetName,
        path,
        currentValue,
        address.toString()
      )

      const derivationPath = path[1]
      set(addressCacheChanges, ['mismatches', derivationPath], {
        cached: currentValue.address.toString(),
        derived: address.toString(),
      })
    }

    set(addressCacheChanges, ['caches', ...path], {
      ...currentValue,
      synced: false,
      address,
    })

    await this.#update(addressCacheChanges)
  }

  stop = () => {
    this.#unsubscribe?.()
    this.#writeToDisk?.cancel() // alternatively: flush(), but will have to await then
    this.#writeToDisk = null
    this.#throttledUpdateFusion?.cancel()
    this.#throttledUpdateFusion = null
  }
}

// todo delete address cache for portfolio when deleted
// todo update headless to not take `addressCache` id & refactor addresses provider to use this instead
const addressCacheModuleDefinition = {
  id: 'addressCache',
  factory: (deps) => new AddressCache({ ...deps }),
  type: 'module',
  dependencies: [
    'addressCacheAtom',
    'fusion',
    'logger',
    'storage',
    'enabledWalletAccountsAtom',
    'config',
  ],
  public: true,
}

export default addressCacheModuleDefinition
