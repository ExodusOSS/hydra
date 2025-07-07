import { createInMemoryAtom } from '@exodus/atoms'
import createInMemoryStorage from '@exodus/storage-memory'
import lodash from 'lodash'
import pDefer from 'p-defer'

import addressCacheModuleDefinition from '../index.js'

const { get } = lodash

const btcFirstBip32Path = "m/84'/0'/0'"
const btcFirstPath = `${btcFirstBip32Path}/0/0`
const btcFirstPathWithAsset = `${btcFirstBip32Path}/0/0`

// adjusted from https://github.com/ExodusMovement/exodus-mobile/blob/fa90f9003afe6b7a7212a9356a0b97b7c328816e/src/_local_modules/keys/derive.js#L26

// note: address cache is not connected to accounts, it will always have different addresses

const receiveAddresses = {
  bitcoin: 'bc1qra6g60wnu8tdp8nfgp9te90rqf4txdflm99hk2',
  kava: 'kava1fzjh88d70kjcz4whvvn98xr7lqax7txcm0tq6k',
  osmosis: 'osmo17ux3h6fs0ethay4xm065wh2pkuhw8kjy9u27ne',
  ethereum: '0x3a6c678ab6f5c1e6B77D0ecDdDa81f998162E14f',
  cardano:
    'addr1qykynnu4tsg7ewx5e52xf6r94exy06qyps6j4c0s025txk3vf88e2hq3ajudfng5vn5xttjvgl5qgrp49tslq74gkddqc7usjq',
}

let simulateFusionProcessBatch, fusion, fusionChannel, addressCacheAtom, addressCache, storage

describe('address cache', () => {
  beforeEach(async () => {
    jest.useRealTimers()
    simulateFusionProcessBatch = undefined
    fusionChannel = undefined
    storage = createInMemoryStorage()
    addressCacheAtom = createInMemoryAtom()
    fusion = {
      channel: ({ processBatch }) => {
        simulateFusionProcessBatch = processBatch
        fusionChannel = {
          awaitProcessed: jest.fn(),
          push: jest.fn(),
        }
        return fusionChannel
      },
    }
    addressCache = addressCacheModuleDefinition.factory({
      logger: console,
      addressCacheAtom,
      fusion,
      enabledWalletAccountsAtom: {
        get: () => ({ exodus_0: 'test', exodus_1: 'test' }),
        observe: (f) => {
          f({ exodus_0: 'test', exodus_1: 'test' })
        },
      },
      storage,
      config: {},
    })
  })

  afterEach(async () => {
    await addressCache.clear()
    await addressCache.stop()
  })

  it('waits for fusion to sync', async () => {
    await addressCache.load()
    await addressCache.awaitSynced()
    expect(fusionChannel.awaitProcessed).toHaveBeenCalled()
  })

  it('clears data & storage', async () => {
    jest.useFakeTimers()
    await addressCache.load()

    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
      address: receiveAddresses.bitcoin,
    })
    // Flush the write to disk (throttled)
    await jest.advanceTimersByTimeAsync(60_000)

    await expect(
      addressCache.get({
        walletAccountName: 'exodus_0',
        baseAssetName: 'bitcoin',
        derivationPath: btcFirstPath,
      })
    ).resolves.toEqual({ address: receiveAddresses.bitcoin, synced: false })

    await expect(storage.namespace('caches').get('exodus_0')).resolves.not.toBe(undefined)

    await addressCache.clear()

    // Flush the write to disk (throttled)
    await jest.advanceTimersByTimeAsync(60_000)

    await expect(
      addressCache.get({
        walletAccountName: 'exodus_0',
        baseAssetName: 'bitcoin',
        derivationPath: btcFirstPath,
      })
    ).resolves.toBe(undefined)

    await expect(storage.namespace('caches').get('exodus_0')).resolves.toBe(undefined)
  })

  it("atom doesn't hold data until initialized", async () => {
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('get not instant'))
      }, 100)
    })

    let err
    await Promise.race([addressCacheAtom.get(), timeoutPromise]).catch((error) => {
      err = error
    })
    expect(err).toEqual(new Error('get not instant'))
  })

  it('loads data', async () => {
    await addressCache.load()
    const dataAfter = await addressCacheAtom.get()

    expect(dataAfter).toEqual({
      caches: {
        exodus_0: {},
        exodus_1: {},
      },
      mismatches: {},
    })
  })

  it('adds address', async () => {
    await addressCache.load()
    jest.useFakeTimers()
    const dataBefore = await addressCacheAtom.get()

    expect(dataBefore).toEqual({
      caches: {
        exodus_0: {},
        exodus_1: {},
      },
      mismatches: {},
    })

    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
      address: receiveAddresses.bitcoin,
    })

    await jest.runAllTimersAsync()
    expect(fusionChannel.push).toHaveBeenCalledTimes(1)
    expect(fusionChannel.push).toHaveBeenCalledWith({
      type: 'addressCache',
      data: {
        exodus_0: { [btcFirstPathWithAsset]: receiveAddresses.bitcoin },
      },
    })

    await simulateFusionProcessBatch([
      { data: { exodus_0: { [btcFirstPathWithAsset]: receiveAddresses.bitcoin } } },
    ])

    await addressCache.set({
      walletAccountName: 'exodus_1',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
      address: receiveAddresses.bitcoin,
    })

    await jest.runAllTimersAsync()
    expect(fusionChannel.push).toHaveBeenCalledTimes(2)
    expect(fusionChannel.push).toHaveBeenCalledWith({
      type: 'addressCache',
      data: {
        exodus_1: { [btcFirstPathWithAsset]: receiveAddresses.bitcoin },
      },
    })

    const dataAfter = await addressCacheAtom.get()

    expect(dataAfter).toEqual({
      caches: {
        exodus_0: {
          [btcFirstPathWithAsset]: {
            synced: true,
            address: receiveAddresses.bitcoin,
          },
        },
        exodus_1: {
          [btcFirstPathWithAsset]: {
            synced: false,
            address: receiveAddresses.bitcoin,
          },
        },
      },
      mismatches: {},
    })

    await expect(storage.namespace('caches').get('exodus_0')).resolves.toEqual({
      [btcFirstPathWithAsset]: {
        synced: true,
        address: receiveAddresses.bitcoin,
      },
    })
    jest.useRealTimers()
  })

  it('supports batching addresses in fusion push', async () => {
    await addressCache.load()
    jest.useFakeTimers()
    const dataBefore = await addressCacheAtom.get()

    expect(dataBefore).toEqual({
      caches: {
        exodus_0: {},
        exodus_1: {},
      },
      mismatches: {},
    })

    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
      address: receiveAddresses.bitcoin,
    })
    await jest.advanceTimersByTimeAsync(500)
    expect(fusionChannel.push).toHaveBeenCalledTimes(0)

    await addressCache.set({
      walletAccountName: 'exodus_1',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
      address: receiveAddresses.bitcoin,
    })
    await jest.advanceTimersByTimeAsync(500)
    expect(fusionChannel.push).toHaveBeenCalledTimes(0)

    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'kava',
      derivationPath: 'test',
      address: receiveAddresses.kava,
    })
    await jest.advanceTimersByTimeAsync(500)

    await jest.advanceTimersByTimeAsync(60_000)
    expect(fusionChannel.push).toHaveBeenCalledTimes(1)
    expect(fusionChannel.push).toHaveBeenCalledWith({
      type: 'addressCache',
      data: {
        exodus_0: {
          'kava/test': receiveAddresses.kava,
          "m/84'/0'/0'/0/0": receiveAddresses.bitcoin,
        },
        exodus_1: { [btcFirstPathWithAsset]: receiveAddresses.bitcoin },
      },
    })
  })

  it(`multiple .set() calls don't race when not synced yet`, async () => {
    let awaitProcessedResolve = null
    jest.useFakeTimers()
    addressCache = addressCacheModuleDefinition.factory({
      logger: console,
      addressCacheAtom,
      fusion: {
        channel: ({ processBatch }) => {
          simulateFusionProcessBatch = processBatch
          fusionChannel = {
            awaitProcessed: () =>
              new Promise((resolve) => {
                awaitProcessedResolve = resolve
              }),
            push: jest.fn(),
          }
          return fusionChannel
        },
      },
      enabledWalletAccountsAtom: {
        get: () => ({ exodus_0: 'test', exodus_1: 'test' }),
        observe: (f) => {
          f({ exodus_0: 'test', exodus_1: 'test' })
        },
      },
      storage,
      config: {},
    })

    await addressCache.load()

    // Let's race a thousand calls to set the same address
    const horses = Promise.all(
      Array.from({ length: 1000 }, () =>
        addressCache.set({
          walletAccountName: 'exodus_0',
          baseAssetName: 'bitcoin',
          derivationPath: btcFirstPath,
          address: receiveAddresses.bitcoin,
        })
      )
    )

    // Let's advance the timers a few times, to trap multiple runs of
    // `throttledUpdateFusion`, they should now all be stuck in
    // await this.#getSyncedChannel() since we haven't yet resolved
    // awaitProcessed
    for (let i = 0; i < 1000; i++) {
      await jest.advanceTimersByTimeAsync(60_000)
    }

    // Now we resolve the awaitProcessed, this should release all horses
    // and spam "scheduled a push of address cache to fusion" in console
    awaitProcessedResolve()
    // And we wait for all horses to finish
    await horses
    await jest.advanceTimersByTimeAsync(60_000)
    // Now we can check how many times we pushed to fusion
    expect(fusionChannel.push).toHaveBeenCalledTimes(1)
    expect(fusionChannel.push).toHaveBeenCalledWith({
      type: 'addressCache',
      data: {
        exodus_0: { [btcFirstPathWithAsset]: receiveAddresses.bitcoin },
      },
    })
  })

  it(`it should not push address to fusion before completing a sync down`, async () => {
    jest.useFakeTimers()

    let _processBatch = null
    const pAwaitProcessed = pDefer()
    const push = jest.fn()
    fusion.channel = jest.fn(({ processBatch }) => {
      _processBatch = processBatch
      return {
        awaitProcessed: () => pAwaitProcessed.promise,
        push,
      }
    })

    await addressCache.load()

    expect(fusion.channel).toHaveBeenCalledTimes(1)

    // Schedule a sync up from fusion with the same address
    // that we already have in the fusion channel, but not yet in the in memory cache.
    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
      address: receiveAddresses.bitcoin,
    })

    await _processBatch([
      { data: { exodus_0: { [btcFirstPathWithAsset]: receiveAddresses.bitcoin } } },
    ])
    // Signal that we are done processing the batch
    pAwaitProcessed.resolve()

    await jest.advanceTimersByTimeAsync(65_000)

    // Ensure that `.set()` awaited the processing of the batch
    // before computing the difference and pushing to fusion
    expect(push).toHaveBeenCalledTimes(0)
  })

  it('supports sync down while having data to sync up', async () => {
    await addressCache.load()
    jest.useFakeTimers()
    const dataBefore = await addressCacheAtom.get()

    expect(dataBefore).toEqual({
      caches: {
        exodus_0: {},
        exodus_1: {},
      },
      mismatches: {},
    })

    // Schedule a sync up from fusion
    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
      address: receiveAddresses.bitcoin,
    })

    // Simulate sync down from fusion
    await expect(
      simulateFusionProcessBatch([
        { data: { exodus_1: { [btcFirstPathWithAsset]: receiveAddresses.bitcoin } } },
      ])
    ).resolves.toBe(undefined)

    await jest.runAllTimersAsync()
    expect(fusionChannel.push).toHaveBeenCalledTimes(1)
    expect(fusionChannel.push).toHaveBeenCalledWith({
      type: 'addressCache',
      data: {
        exodus_0: { [btcFirstPathWithAsset]: receiveAddresses.bitcoin },
      },
    })

    const dataAfter = await addressCacheAtom.get()
    expect(dataAfter).toEqual({
      caches: {
        exodus_0: {
          [btcFirstPathWithAsset]: {
            synced: false,
            address: receiveAddresses.bitcoin,
          },
        },
        exodus_1: {
          [btcFirstPathWithAsset]: {
            synced: true,
            address: receiveAddresses.bitcoin,
          },
        },
      },
      mismatches: {},
    })
  })

  it('supports sync down when a mismatch was detected scheduled to sync up', async () => {
    /**
     * 1. visit receive address screen -> re-derives the address
     * 2. we notice there is a mismatch & want to re-sync the address to fusion -> set synced to false
     * 3. fusion syncs down & clobbers the synced flag -> leaving us with the incorrect address in fusion & we never push up the correct address
     */
    await addressCache.load()
    jest.useFakeTimers()

    // Setup the address cache with a mismatch
    await expect(
      simulateFusionProcessBatch([
        { data: { exodus_0: { [btcFirstPathWithAsset]: 'incorrect address' } } },
      ])
    ).resolves.toBe(undefined)

    // Verify the address cache is wrong before starting
    expect(await addressCacheAtom.get()).toEqual({
      caches: {
        exodus_0: {
          [btcFirstPathWithAsset]: {
            synced: true,
            address: 'incorrect address',
          },
        },
        exodus_1: {},
      },
      mismatches: {},
    })

    // we notice there is a mismatch & want to re-sync the address to fusion -> set synced to false
    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
      address: 'correct address',
    })

    // Verify the address cache has properly detected the mismatch
    // and is ready to push the correct address to fusion
    expect(await addressCacheAtom.get()).toEqual({
      caches: {
        exodus_0: {
          [btcFirstPathWithAsset]: {
            synced: false,
            address: 'correct address',
          },
        },
        exodus_1: {},
      },
      mismatches: {
        [btcFirstPathWithAsset]: {
          cached: 'incorrect address',
          derived: 'correct address',
        },
      },
    })

    // fusion syncs down & shouldn't clobber the synced flag
    // -> ensure it doesn't leave us with the incorrect address in fusion & we never push up the correct address
    await expect(
      simulateFusionProcessBatch([
        {
          data: {
            exodus_0: { [btcFirstPathWithAsset]: 'incorrect address' },
            exodus_1: {
              [btcFirstPathWithAsset]: 'another address to isnt in cache to trigger update',
            },
          },
        },
      ])
    ).resolves.toBe(undefined)

    expect(await addressCacheAtom.get()).toEqual({
      caches: {
        exodus_0: {
          [btcFirstPathWithAsset]: {
            synced: false,
            address: 'correct address',
          },
        },
        exodus_1: {
          [btcFirstPathWithAsset]: {
            address: 'another address to isnt in cache to trigger update',
            synced: true,
          },
        },
      },
      mismatches: {
        [btcFirstPathWithAsset]: {
          cached: 'incorrect address',
          derived: 'correct address',
        },
      },
    })

    await jest.runAllTimersAsync()
    expect(fusionChannel.push).toHaveBeenCalledTimes(1)
    expect(fusionChannel.push).toHaveBeenCalledWith({
      type: 'addressCache',
      data: {
        exodus_0: { [btcFirstPathWithAsset]: 'correct address' },
      },
    })
  })

  it.skip('update has concurrency one', async () => {})

  it("doesn't sync down fusion before load", async () => {
    expect(simulateFusionProcessBatch).toBe(undefined)
  })

  it('syncs down from fusion after load', async () => {
    await addressCache.load()
    await expect(simulateFusionProcessBatch([])).resolves.toBe(undefined)
    const dataBefore = await addressCacheAtom.get()

    expect(dataBefore).toEqual({
      caches: {
        exodus_0: {},
        exodus_1: {},
      },
      mismatches: {},
    })

    await expect(
      simulateFusionProcessBatch([
        { data: { exodus_0: { [btcFirstPathWithAsset]: receiveAddresses.bitcoin } } },
      ])
    ).resolves.toBe(undefined)

    const dataAfter = await addressCacheAtom.get()
    expect(dataAfter).toEqual({
      caches: {
        exodus_0: {
          [btcFirstPathWithAsset]: {
            synced: true,
            address: receiveAddresses.bitcoin,
          },
        },
        exodus_1: {},
      },
      mismatches: {},
    })
  })

  it('sync flag never goes from true to false on same address', async () => {
    jest.useFakeTimers()
    await addressCache.load()
    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
      address: receiveAddresses.bitcoin,
    })

    await jest.runAllTimersAsync()
    expect(fusionChannel.push).toHaveBeenCalledTimes(1)

    await expect(
      simulateFusionProcessBatch([
        { data: { exodus_0: { [btcFirstPathWithAsset]: receiveAddresses.bitcoin } } },
      ])
    ).resolves.toBe(undefined)

    const dataAfter = await addressCacheAtom.get()
    expect(dataAfter).toEqual({
      caches: {
        exodus_0: {
          [btcFirstPathWithAsset]: {
            synced: true,
            address: receiveAddresses.bitcoin,
          },
        },
        exodus_1: {},
      },
      mismatches: {},
    })

    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
      address: receiveAddresses.bitcoin,
    })

    await jest.runAllTimersAsync()

    expect(fusionChannel.push).toHaveBeenCalledTimes(1)

    const dataAfter1 = await addressCacheAtom.get()
    expect(dataAfter1).toEqual({
      caches: {
        exodus_0: {
          [btcFirstPathWithAsset]: {
            synced: true,
            address: receiveAddresses.bitcoin,
          },
        },
        exodus_1: {},
      },
      mismatches: {},
    })
  })

  it('sync flag never goes from true to false on same address, mock `awaitProcessed` delay', async () => {
    let awaitProcessedResolve = null
    jest.useFakeTimers()
    addressCache = addressCacheModuleDefinition.factory({
      logger: console,
      addressCacheAtom,
      fusion: {
        channel: ({ processBatch }) => {
          simulateFusionProcessBatch = processBatch
          fusionChannel = {
            awaitProcessed: () =>
              new Promise((resolve) => {
                awaitProcessedResolve = resolve
              }),
            push: jest.fn(),
          }
          return fusionChannel
        },
      },
      enabledWalletAccountsAtom: {
        get: () => ({ exodus_0: 'test', exodus_1: 'test' }),
        observe: (f) => {
          f({ exodus_0: 'test', exodus_1: 'test' })
        },
      },
      storage,
      config: {},
    })

    await addressCache.load()
    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
      address: receiveAddresses.bitcoin,
    })

    await jest.runAllTimersAsync()
    expect(fusionChannel.push).toHaveBeenCalledTimes(0)

    await expect(
      simulateFusionProcessBatch([
        { data: { exodus_0: { [btcFirstPathWithAsset]: receiveAddresses.bitcoin } } },
      ])
    ).resolves.toBe(undefined)

    expect(fusionChannel.push).toHaveBeenCalledTimes(0)

    const dataAfter = await addressCacheAtom.get()
    expect(dataAfter).toEqual({
      caches: {
        exodus_0: {
          [btcFirstPathWithAsset]: {
            synced: true,
            address: receiveAddresses.bitcoin,
          },
        },
        exodus_1: {},
      },
      mismatches: {},
    })

    expect(fusionChannel.push).toHaveBeenCalledTimes(0)

    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
      address: receiveAddresses.bitcoin,
    })

    await jest.runAllTimersAsync()
    expect(fusionChannel.push).toHaveBeenCalledTimes(0)

    const dataAfter1 = await addressCacheAtom.get()
    expect(dataAfter1).toEqual({
      caches: {
        exodus_0: {
          [btcFirstPathWithAsset]: {
            synced: true,
            address: receiveAddresses.bitcoin,
          },
        },
        exodus_1: {},
      },
      mismatches: {},
    })
    awaitProcessedResolve()
  })

  it('synced:true is cleared on mismatch', async () => {
    jest.useFakeTimers()
    await addressCache.load()

    await expect(
      simulateFusionProcessBatch([
        { data: { exodus_0: { [btcFirstPathWithAsset]: receiveAddresses.bitcoin } } },
      ])
    ).resolves.toBe(undefined)

    const dataAfter = await addressCacheAtom.get()
    expect(dataAfter).toEqual({
      caches: {
        exodus_0: {
          [btcFirstPathWithAsset]: {
            synced: true,
            address: receiveAddresses.bitcoin,
          },
        },
        exodus_1: {},
      },
      mismatches: {},
    })

    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
      address: 'test',
    })

    await jest.runAllTimersAsync()

    expect(fusionChannel.push).toHaveBeenCalledWith({
      type: 'addressCache',
      data: {
        exodus_0: { [btcFirstPathWithAsset]: 'test' },
      },
    })

    const dataAfter1 = await addressCacheAtom.get()
    expect(dataAfter1).toEqual({
      caches: {
        exodus_0: {
          [btcFirstPathWithAsset]: {
            synced: false,
            address: 'test',
          },
        },
        exodus_1: {},
      },
      mismatches: {
        [btcFirstPathWithAsset]: {
          cached: receiveAddresses.bitcoin,
          derived: 'test',
        },
      },
    })
  })

  it('adds assetName to path for some assets', async () => {
    await addressCache.load()
    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'kava',
      derivationPath: 'test',
      address: receiveAddresses.kava,
    })

    expect(get(await addressCacheAtom.get(), ['caches', 'exodus_0', 'kava/test', 'address'])).toBe(
      receiveAddresses.kava
    )

    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'osmosis',
      derivationPath: 'test',
      address: receiveAddresses.osmosis,
    })

    expect(
      get(await addressCacheAtom.get(), ['caches', 'exodus_0', 'osmosis/test', 'address'])
    ).toBe(receiveAddresses.osmosis)

    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'ethereum',
      derivationPath: 'test',
      address: receiveAddresses.ethereum,
    })

    expect(get(await addressCacheAtom.get(), ['caches', 'exodus_0', 'test', 'address'])).toBe(
      receiveAddresses.ethereum
    )
  })

  it('returns mismatches', async () => {
    await addressCache.load()
    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'kava',
      derivationPath: 'test',
      address: receiveAddresses.kava,
    })

    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'kava',
      derivationPath: 'test',
      address: receiveAddresses.osmosis,
    })

    const mismatches = await addressCache.getMismatches()
    expect(mismatches).toEqual({
      'kava/test': {
        cached: receiveAddresses.kava,
        derived: receiveAddresses.osmosis,
      },
    })
  })
})
