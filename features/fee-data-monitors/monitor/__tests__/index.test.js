import { FeeData } from '@exodus/asset-lib'
import { createInMemoryAtom } from '@exodus/atoms'
import EventEmitter from 'events' // eslint-disable-line @exodus/restricted-imports/no-node-core-events

import feeMonitorsDefinition from '../index.js'

const { factory: createFeeMonitors } = feeMonitorsDefinition

const defaultAvailableAssetNames = ['bitcoin', 'ethereum', 'solana']

const defaultFeeData = new FeeData({ config: { value: 1 }, currency: {} })

const dummyRemoteConfig = () => {
  const emitter = new EventEmitter()
  return {
    on: (...args) => emitter.on(...args),
    sync: (feeData) => emitter.emit('sync', { current: { assets: { solana: { feeData } } } }),
  }
}

class DummyFeeMonitor {
  constructor({ assetName, updateFee }) {
    this.assetName = assetName
    this.updateFee = updateFee
  }

  tick = async (feeConfig) => {
    this.updateFee(this.assetName, feeConfig)
  }

  start = jest.fn(() => async () => {})
}

describe('createFeeMonitors', () => {
  let assetsModule
  let remoteConfig
  let solanaMonitor
  let createFeeMonitor
  let feeDataAtom
  let availableAssetNamesAtom
  let monitors
  let logger
  let startError

  const baseAssetNamesToMonitorAtom = createInMemoryAtom({
    defaultValue: ['solana'],
  })

  beforeEach(() => {
    createFeeMonitor = jest.fn((args) => {
      solanaMonitor = new DummyFeeMonitor({ assetName: 'solana', ...args })
      if (startError) {
        solanaMonitor.start.mockImplementation(() => {
          throw new Error(startError)
        })
      }

      return solanaMonitor
    })

    const solana = {
      name: 'solana',
      baseAsset: { name: 'solana' },
      currency: {},
      api: {
        createFeeMonitor,
        features: { feeMonitor: true },
        hasFeature: () => true,
        getFeeData: () => defaultFeeData,
      },
    }

    const assets = { solana }
    assetsModule = { getAssets: () => assets, getAsset: (name) => assets[name] }
    remoteConfig = dummyRemoteConfig()

    feeDataAtom = createInMemoryAtom({ defaultValue: {} })
    availableAssetNamesAtom = createInMemoryAtom({ defaultValue: defaultAvailableAssetNames })
    logger = { error: jest.fn() }
    monitors = createFeeMonitors({
      assetsModule,
      feeDataAtom,
      remoteConfig,
      availableAssetNamesAtom,
      baseAssetNamesToMonitorAtom,
      logger,
    })
  })

  test('should createFeeMonitors', async () => {
    await monitors.start()

    expect(createFeeMonitor).toBeCalledTimes(1)
  })

  test('should not crash if one monitor crashes', async () => {
    startError = 'Failed to start!!!'

    await monitors.start()

    expect(createFeeMonitor).toBeCalledTimes(1)
    expect(logger.error).toBeCalledWith(
      'Cannot start fee monitor for asset solana. Failed to start!!!',
      expect.any(Error)
    )
  })

  test('should start monitors', async () => {
    await monitors.start()

    expect(solanaMonitor.start).toBeCalledTimes(1)
  })

  test('fee data is set after start', async () => {
    await monitors.start()
    const fees = await feeDataAtom.get()

    expect(Object.keys(fees).length).toBeGreaterThan(0)
  })

  test('remote config always overrides', async () => {
    await monitors.start()

    expect(solanaMonitor.start).toBeCalledTimes(1)

    // before the first tick we have the default FeeData
    expect(await monitors.getFeeData({ assetName: 'solana' })).toEqual(defaultFeeData)

    // first tick
    await solanaMonitor.tick({ value: 2, foo: 42 })
    expect(await monitors.getFeeData({ assetName: 'solana' })).toEqual({ value: 2, foo: 42 })

    // remote config override
    await remoteConfig.sync({ value: 3 })
    expect(await monitors.getFeeData({ assetName: 'solana' })).toEqual({ value: 3, foo: 42 })

    // monitor update ignored becuase of remote override
    await solanaMonitor.tick({ value: 4 })
    expect(await monitors.getFeeData({ assetName: 'solana' })).toEqual({ value: 3, foo: 42 })

    // cancel override, revert to last monitor update (if any)
    await remoteConfig.sync({})
    expect(await monitors.getFeeData({ assetName: 'solana' })).toEqual({ value: 4, foo: 42 })

    // monitor updates register again
    await solanaMonitor.tick({ value: 5 })
    expect(await monitors.getFeeData({ assetName: 'solana' })).toEqual({ value: 5, foo: 42 })
  })
})
