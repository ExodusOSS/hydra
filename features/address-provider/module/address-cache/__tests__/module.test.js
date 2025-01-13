import './mock.lodash.throttle.js'

import { createInMemoryAtom } from '@exodus/atoms'
import createInMemoryStorage from '@exodus/storage-memory'
import delay from 'delay'
import lodash from 'lodash'

import addressCacheModuleDefinition from '../index.js'

const { get } = lodash

const btcFirstBip32Path = "m/84'/0'/0'"
const btcFirstPath = `${btcFirstBip32Path}/0/0`
const btcFirstPathWithAsset = `${btcFirstBip32Path}/0/0`

// adjusted from https://github.com/ExodusMovement/exodus-mobile/blob/fa90f9003afe6b7a7212a9356a0b97b7c328816e/src/_local_modules/keys/derive.js#L26

const storage = createInMemoryStorage()

// note: address cache is not connected to accounts, it will always have different addresses

const receiveAddresses = {
  bitcoin: 'bc1qra6g60wnu8tdp8nfgp9te90rqf4txdflm99hk2',
  kava: 'kava1fzjh88d70kjcz4whvvn98xr7lqax7txcm0tq6k',
  osmosis: 'osmo17ux3h6fs0ethay4xm065wh2pkuhw8kjy9u27ne',
  ethereum: '0x3a6c678ab6f5c1e6B77D0ecDdDa81f998162E14f',
  cardano:
    'addr1qykynnu4tsg7ewx5e52xf6r94exy06qyps6j4c0s025txk3vf88e2hq3ajudfng5vn5xttjvgl5qgrp49tslq74gkddqc7usjq',
}

let simulateFusionProcessBatch, fusionChannel, addressCacheAtom, addressCache

describe('address cache', () => {
  beforeEach(async () => {
    simulateFusionProcessBatch = undefined
    fusionChannel = undefined
    addressCacheAtom = createInMemoryAtom()
    addressCache = addressCacheModuleDefinition.factory({
      logger: console,
      addressCacheAtom,
      fusion: {
        channel: ({ processBatch }) => {
          simulateFusionProcessBatch = processBatch
          fusionChannel = {
            awaitProcessed: jest.fn(),
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
  })

  afterEach(async () => {
    await addressCache.clear()
  })

  it('waits for fusion to sync', async () => {
    await addressCache.load()
    await addressCache.awaitSynced()
    expect(fusionChannel.awaitProcessed).toHaveBeenCalled()
  })

  it('clears data & storage', async () => {
    await addressCache.load()

    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
      address: receiveAddresses.bitcoin,
    })

    await expect(
      addressCache.get({
        walletAccountName: 'exodus_0',
        baseAssetName: 'bitcoin',
        derivationPath: btcFirstPath,
      })
    ).resolves.toEqual({ address: receiveAddresses.bitcoin, synced: false })

    await expect(storage.namespace('caches').get('exodus_0')).resolves.not.toBe(undefined)

    await addressCache.clear()

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

    await delay(0)

    expect(fusionChannel.push).toHaveBeenCalledTimes(1)

    await addressCache.set({
      walletAccountName: 'exodus_1',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
      address: receiveAddresses.bitcoin,
    })

    await delay(0)

    expect(fusionChannel.push).toHaveBeenCalledTimes(2)

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
            synced: false,
            address: receiveAddresses.bitcoin,
          },
        },
      },
      mismatches: {},
    })

    await expect(storage.namespace('caches').get('exodus_0')).resolves.toEqual({
      [btcFirstPathWithAsset]: {
        synced: false,
        address: receiveAddresses.bitcoin,
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
    await addressCache.load()
    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
      address: receiveAddresses.bitcoin,
    })

    await delay(0)

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

    await delay(0)

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
    addressCache = addressCacheModuleDefinition.factory({
      logger: console,
      addressCacheAtom,
      fusion: {
        channel: ({ processBatch }) => {
          simulateFusionProcessBatch = processBatch
          fusionChannel = {
            awaitProcessed: () => delay(100),
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

    await delay(0)

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

    await delay(0)

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
  })

  it('synced:true is cleared on mismatch', async () => {
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

    await delay(0)

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
