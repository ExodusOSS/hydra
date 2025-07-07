import { assetsListToObject, connectAssets } from '@exodus/assets'
import _assets from '@exodus/assets-base'
import { createInMemoryAtom } from '@exodus/atoms'
import _combinedAssets from '@exodus/combined-assets-meta'
import EventEmitter from 'events/events.js'
import lodash from 'lodash'
import process from 'process'

import txLogMonitorDefinition from '../module/index.js'

const { cloneDeep } = lodash

const globalAssetRegistry = connectAssets({ ..._assets, ...assetsListToObject(_combinedAssets) })
const createMonitors = (args) =>
  txLogMonitorDefinition.factory({
    ...args,
    logger: {},
  })

const getAssetsForTesting = () => {
  const assets = cloneDeep(globalAssetRegistry)

  for (const asset of Object.values(assets)) {
    asset.api = {}
    asset.api.createHistoryMonitor = jest.fn(() => {
      expect(asset.mockedMonitor).toBeUndefined()

      const hooks = {}

      const callHook = async (name) => {
        for (const hook of hooks[name] || []) {
          await hook({ assetName: asset.name })
        }
      }

      const start = async () => {
        await callHook('before-start')
        await callHook('after-start')
      }

      const addHook = (type, hook) => {
        if (!hooks[type]) hooks[type] = []
        hooks[type].push(hook)
      }

      asset.mockedMonitor = {
        start: jest.fn(start),
        stop: jest.fn(),
        addHook: jest.fn(addHook),
        setServer: jest.fn(),
      }

      return asset.mockedMonitor
    })
  }

  return assets
}

describe('txLogMonitors', () => {
  let assetsModule
  let baseAssetNamesToMonitorAtom
  let assets
  let assetsConfigAtom

  const baseAssetNamesToMonitorAtomMockValue = ['solana']

  beforeEach(async () => {
    assets = getAssetsForTesting()
    assetsModule = Object.assign(new EventEmitter(), {
      getAssets: () => assets,
      getAsset: (assetName) => assets[assetName],
      getBaseAssetNames: () =>
        Object.keys(assets, (assetName) => assetName === assets[assetName].baseAsset.name),
    })

    assetsModule.getAssets = () => assets
    assetsModule.getAsset = (assetName) => assets[assetName]
    baseAssetNamesToMonitorAtom = createInMemoryAtom({
      defaultValue: baseAssetNamesToMonitorAtomMockValue,
    })
    assetsConfigAtom = createInMemoryAtom({ defaultValue: {} })
  })

  test('should create module without starting monitors', () => {
    const assetsConfigAtom = createInMemoryAtom({ defaultValue: {} })
    const monitors = createMonitors({
      assetsModule,
      assetClientInterface: {},
      assetsConfigAtom,
      baseAssetNamesToMonitorAtom,
    })
    expect(monitors).toBeDefined()

    const validAssets = Object.values(assets).filter((asset) => asset.api?.createHistoryMonitor)

    // No monitors where created...
    expect(validAssets.length).toBeGreaterThan(5)

    validAssets.forEach((asset) => {
      expect(asset.api.createHistoryMonitor).toBeCalledTimes(0)
    })

    const assetsWithMonitors = Object.values(assets).filter((asset) => asset.mockedMonitor)

    expect(assetsWithMonitors.length).toEqual(0)
  })

  test('should start monitors once', async () => {
    const assetsConfigAtom = createInMemoryAtom({ defaultValue: {} })
    const monitors = createMonitors({
      assetsModule,
      assetClientInterface: {},
      assetsConfigAtom,
      baseAssetNamesToMonitorAtom,
    })

    await monitors.start()

    const assetsWithMonitors = Object.values(assets).filter((asset) => asset.mockedMonitor)
    expect(assetsWithMonitors.length).toEqual(
      Object.keys(baseAssetNamesToMonitorAtomMockValue).length
    )

    const expectMonitorsStartedOnce = () => {
      for (const assetWithMonitor of assetsWithMonitors) {
        expect(assetWithMonitor.api.createHistoryMonitor).toBeCalledTimes(1)
        expect(assetWithMonitor.mockedMonitor.start).toBeCalledTimes(1)
      }
    }

    expectMonitorsStartedOnce()

    await monitors.start()

    // NO OPS
    expectMonitorsStartedOnce()
  })

  test('should update monitor with new remote value', async () => {
    const initialConfig = { url: 'exodude.com ' }
    const newConfig = { url: 'exodus.com' }

    const assetsConfigAtom = createInMemoryAtom({ defaultValue: { solana: initialConfig } })
    const monitors = createMonitors({
      assetsModule,
      assetClientInterface: {},
      assetsConfigAtom,
      baseAssetNamesToMonitorAtom,
    })
    await monitors.start()

    expect(assets.solana.api.createHistoryMonitor).toBeCalledTimes(1)
    expect(assets.solana.mockedMonitor.start).toBeCalledTimes(1)

    await assetsConfigAtom.set({ solana: newConfig })
    expect(assets.solana.mockedMonitor.setServer).toBeCalledTimes(2)
    expect(assets.solana.mockedMonitor.setServer).toHaveBeenNthCalledWith(1, initialConfig)
    expect(assets.solana.mockedMonitor.setServer).toHaveBeenNthCalledWith(2, newConfig)
  })

  test('should not update monitor if config didnt change', async () => {
    const assetsConfigAtom = createInMemoryAtom({
      defaultValue: { solana: { url: 'exodus.com' } },
    })
    const monitors = createMonitors({
      assetsModule,
      assetClientInterface: {},
      assetsConfigAtom,
      baseAssetNamesToMonitorAtom,
    })

    await monitors.start()

    expect(assets.solana.api.createHistoryMonitor).toBeCalledTimes(1)
    expect(assets.solana.mockedMonitor.start).toBeCalledTimes(1)

    await assetsConfigAtom.set({ solana: { url: 'exodus.com' } })

    expect(assets.solana.mockedMonitor.setServer).toBeCalledTimes(1)
  })

  test('should sync with enabled assets', async () => {
    const monitors = createMonitors({
      assetsModule,
      assetClientInterface: {},
      assetsConfigAtom,
      baseAssetNamesToMonitorAtom,
    })

    await monitors.start()

    expect(assets.solana.api.createHistoryMonitor).toBeCalledTimes(1)
    expect(assets.solana.mockedMonitor.start).toBeCalledTimes(1)

    await baseAssetNamesToMonitorAtom.set(['ethereum'])
    await new Promise((resolve) => process.nextTick(resolve))

    expect(assets.solana.mockedMonitor.stop).toBeCalledTimes(1)

    expect(assets.ethereum.api.createHistoryMonitor).toBeCalledTimes(1)
    expect(assets.ethereum.mockedMonitor.start).toBeCalledTimes(1)
  })

  test('should remove monitors on stop', async () => {
    const monitors = createMonitors({
      assetsModule,
      assetClientInterface: {},
      assetsConfigAtom,
      baseAssetNamesToMonitorAtom,
    })

    await monitors.start()

    expect(assets.solana.api.createHistoryMonitor).toBeCalledTimes(1)
    expect(assets.solana.mockedMonitor.start).toBeCalledTimes(1)
    expect(assets.solana.mockedMonitor.stop).toBeCalledTimes(0)

    await monitors.stop()

    expect(assets.solana.mockedMonitor.stop).toBeCalledTimes(1)
  })
})
