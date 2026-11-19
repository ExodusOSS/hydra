import { testAssets } from '@exodus/assets-test-meta'
import { createInMemoryAtom } from '@exodus/atoms'
import lodash from 'lodash'
import process from 'process'

import txLogMonitorDefinition from '../module/index.js'

const { cloneDeep } = lodash

const globalAssetRegistry = testAssets
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
  let assetsAtom
  let baseAssetNamesToMonitorAtom
  let assets
  let assetsConfigAtom

  const baseAssetNamesToMonitorAtomMockValue = ['solana']

  beforeEach(async () => {
    assets = getAssetsForTesting()
    assetsAtom = createInMemoryAtom({ defaultValue: { value: assets } })
    baseAssetNamesToMonitorAtom = createInMemoryAtom({
      defaultValue: baseAssetNamesToMonitorAtomMockValue,
    })
    assetsConfigAtom = createInMemoryAtom({ defaultValue: {} })
  })

  test('should create module without starting monitors', () => {
    const assetsConfigAtom = createInMemoryAtom({ defaultValue: {} })
    const monitors = createMonitors({
      assetsAtom,
      assetClientInterface: {},
      assetsConfigAtom,
      baseAssetNamesToMonitorAtom,
    })
    expect(monitors).toBeDefined()

    const validAssets = Object.values(assets).filter((asset) => asset.api?.createHistoryMonitor)

    // No monitors where created...
    expect(validAssets.length).toBeGreaterThan(5)

    validAssets.forEach((asset) => {
      expect(asset.api.createHistoryMonitor).toHaveBeenCalledTimes(0)
    })

    const assetsWithMonitors = Object.values(assets).filter((asset) => asset.mockedMonitor)

    expect(assetsWithMonitors.length).toEqual(0)
  })

  test('should start monitors once', async () => {
    const assetsConfigAtom = createInMemoryAtom({ defaultValue: {} })
    const monitors = createMonitors({
      assetsAtom,
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
        expect(assetWithMonitor.api.createHistoryMonitor).toHaveBeenCalledTimes(1)
        expect(assetWithMonitor.mockedMonitor.start).toHaveBeenCalledTimes(1)
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
      assetsAtom,
      assetClientInterface: {},
      assetsConfigAtom,
      baseAssetNamesToMonitorAtom,
    })
    await monitors.start()
    await new Promise((resolve) => process.nextTick(resolve))

    expect(assets.solana.api.createHistoryMonitor).toHaveBeenCalledTimes(1)
    expect(assets.solana.mockedMonitor.start).toHaveBeenCalledTimes(1)

    await assetsConfigAtom.set({ solana: newConfig })

    expect(assets.solana.mockedMonitor.setServer).toHaveBeenCalledTimes(2)
    expect(assets.solana.mockedMonitor.setServer).toHaveBeenNthCalledWith(1, initialConfig)
    expect(assets.solana.mockedMonitor.setServer).toHaveBeenNthCalledWith(2, newConfig)
  })

  test('should not update monitor if config didnt change', async () => {
    const assetsConfigAtom = createInMemoryAtom({
      defaultValue: { solana: { url: 'exodus.com' } },
    })
    const monitors = createMonitors({
      assetsAtom,
      assetClientInterface: {},
      assetsConfigAtom,
      baseAssetNamesToMonitorAtom,
    })

    await monitors.start()

    expect(assets.solana.api.createHistoryMonitor).toHaveBeenCalledTimes(1)
    expect(assets.solana.mockedMonitor.start).toHaveBeenCalledTimes(1)

    await assetsConfigAtom.set({ solana: { url: 'exodus.com' } })

    expect(assets.solana.mockedMonitor.setServer).toHaveBeenCalledTimes(1)
  })

  test('should sync with enabled assets', async () => {
    const monitors = createMonitors({
      assetsAtom,
      assetClientInterface: {},
      assetsConfigAtom,
      baseAssetNamesToMonitorAtom,
    })

    await monitors.start()

    expect(assets.solana.api.createHistoryMonitor).toHaveBeenCalledTimes(1)
    expect(assets.solana.mockedMonitor.start).toHaveBeenCalledTimes(1)

    await baseAssetNamesToMonitorAtom.set(['ethereum'])
    await new Promise((resolve) => process.nextTick(resolve))

    expect(assets.solana.mockedMonitor.stop).toHaveBeenCalledTimes(1)

    expect(assets.ethereum.api.createHistoryMonitor).toHaveBeenCalledTimes(1)
    expect(assets.ethereum.mockedMonitor.start).toHaveBeenCalledTimes(1)
  })

  test('should remove monitors on stop', async () => {
    const monitors = createMonitors({
      assetsAtom,
      assetClientInterface: {},
      assetsConfigAtom,
      baseAssetNamesToMonitorAtom,
    })

    await monitors.start()

    expect(assets.solana.api.createHistoryMonitor).toHaveBeenCalledTimes(1)
    expect(assets.solana.mockedMonitor.start).toHaveBeenCalledTimes(1)
    expect(assets.solana.mockedMonitor.stop).toHaveBeenCalledTimes(0)

    await monitors.stop()

    expect(assets.solana.mockedMonitor.stop).toHaveBeenCalledTimes(1)
  })
})
