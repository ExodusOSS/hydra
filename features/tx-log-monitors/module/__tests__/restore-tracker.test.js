import { testAssets } from '@exodus/assets-test-meta'
import { createInMemoryAtom } from '@exodus/atoms'
import createInMemoryStorage from '@exodus/storage-memory'
import EventEmitter from 'events/events.js'

import { restoringAssetsAtomDefinition } from '../../atoms/index.js'
import restoreAssetsTrackerDefinition from '../restore-tracker.js'

const assets = testAssets

const defaultConfig = {
  monitorEvents: ['after-tick-multiple-wallet-accounts', 'after-restore'],
}

describe('restore-tracker', () => {
  const setup = (config = {}) => {
    const storage = createInMemoryStorage()
    const assetsAtom = createInMemoryAtom({ defaultValue: { value: assets } })
    const restoringAssetsAtom = restoringAssetsAtomDefinition.factory({ storage })
    const baseAssetNamesToMonitorAtom = createInMemoryAtom({
      defaultValue: ['bitcoin', 'ethereum'],
    })
    const availableAssetNamesAtom = createInMemoryAtom({
      defaultValue: ['bitcoin', 'ethereum'],
    })
    const txLogMonitors = new EventEmitter()
    const module = restoreAssetsTrackerDefinition.factory({
      assetsAtom,
      restoringAssetsAtom,
      baseAssetNamesToMonitorAtom,
      availableAssetNamesAtom,
      txLogMonitors,
      config: { ...defaultConfig, ...config },
    })

    return {
      module,
      txLogMonitors,
      availableAssetNamesAtom,
      baseAssetNamesToMonitorAtom,
      restoringAssetsAtom,
      assetsAtom,
    }
  }

  it('initializes restore-tracker with vanilla construction', () => {
    expect(setup).not.toThrow()
  })

  test('updates restoringAssetsAtom after monitor tick', async () => {
    const { module, txLogMonitors, restoringAssetsAtom } = setup()

    const handler = jest.fn()
    restoringAssetsAtom.observe(handler)

    expect(
      EventEmitter.listenerCount(txLogMonitors, 'after-tick-multiple-wallet-accounts')
    ).toEqual(1)

    await module.restoreAll()

    await new Promise(setImmediate)

    expect(handler).toHaveBeenCalledWith({
      bitcoin: true,
      ethereum: true,
    })

    handler.mockReset()
    txLogMonitors.emit('after-tick-multiple-wallet-accounts', { assetName: 'bitcoin' })
    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledWith({
      ethereum: true,
    })

    handler.mockReset()
    txLogMonitors.emit('after-tick-multiple-wallet-accounts', { assetName: 'ethereum' })
    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledWith({})
  })

  test('updates tokens in restoringAssetsAtom after monitor tick', async () => {
    const { module, txLogMonitors, restoringAssetsAtom, availableAssetNamesAtom } = setup()
    await availableAssetNamesAtom.set(['bitcoin', 'ethereum', 'usdcoin'])
    const handler = jest.fn()
    restoringAssetsAtom.observe(handler)
    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledTimes(1)

    await module.restoreAll()

    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenCalledWith({
      bitcoin: true,
      ethereum: true,
      usdcoin: true,
    })

    handler.mockReset()
    txLogMonitors.emit('after-tick-multiple-wallet-accounts', { assetName: 'bitcoin' })
    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledWith({
      ethereum: true,
      usdcoin: true,
    })

    handler.mockReset()
    txLogMonitors.emit('after-tick-multiple-wallet-accounts', { assetName: 'ethereum' })
    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledWith({})
  })

  test('restoreAsset adds asset to restoringAssetsAtom and waits monitor tick', async () => {
    const { module, txLogMonitors, restoringAssetsAtom } = setup()

    const handler = jest.fn()
    restoringAssetsAtom.observe(handler)

    const initialRestore = async () => {
      await module.restoreAll()
      await new Promise(setImmediate)
      expect(handler).toHaveBeenCalledWith({
        bitcoin: true,
        ethereum: true,
      })
      handler.mockReset()
      txLogMonitors.emit('after-tick-multiple-wallet-accounts', { assetName: 'bitcoin' })
      txLogMonitors.emit('after-tick-multiple-wallet-accounts', { assetName: 'ethereum' })
      await new Promise(setImmediate)
      expect(handler).toHaveBeenCalledWith({})
      handler.mockReset()
    }

    await initialRestore()

    await module.restoreAsset('bitcoin')
    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledWith({
      bitcoin: true,
    })
    txLogMonitors.emit('after-tick-multiple-wallet-accounts', { assetName: 'bitcoin' })
    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledWith({})
  })

  test('restoreAsset does not throw when atom value is undefined', async () => {
    const restoringAssetsAtom = createInMemoryAtom({ defaultValue: undefined })
    const assetsAtom = createInMemoryAtom({ defaultValue: { value: assets } })
    const baseAssetNamesToMonitorAtom = createInMemoryAtom({
      defaultValue: ['bitcoin', 'ethereum'],
    })
    const availableAssetNamesAtom = createInMemoryAtom({
      defaultValue: ['bitcoin', 'ethereum'],
    })
    const txLogMonitors = new EventEmitter()
    const module = restoreAssetsTrackerDefinition.factory({
      assetsAtom,
      restoringAssetsAtom,
      baseAssetNamesToMonitorAtom,
      availableAssetNamesAtom,
      txLogMonitors,
      config: defaultConfig,
    })

    await module.restoreAsset('bitcoin')
    expect(await restoringAssetsAtom.get()).toEqual({ bitcoin: true })
  })

  test('restoreAsset ignores if asset already restoring', async () => {
    const { module, restoringAssetsAtom } = setup()

    const handler = jest.fn()
    restoringAssetsAtom.observe(handler)

    const initialRestore = async () => {
      await module.restoreAll()
      await new Promise(setImmediate)
      expect(handler).toHaveBeenCalledWith({
        bitcoin: true,
        ethereum: true,
      })
      handler.mockReset()
    }

    await initialRestore()

    await module.restoreAsset('bitcoin')
    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledTimes(0)
  })

  test('works with custom monitorEvents', async () => {
    const { module, restoringAssetsAtom, txLogMonitors } = setup({
      monitorEvents: ['custom-restore-event'],
    })
    const handler = jest.fn()
    restoringAssetsAtom.observe(handler)
    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledTimes(1)
    handler.mockReset()
    await module.restoreAll()

    txLogMonitors.emit('custom-restore-event', { assetName: 'bitcoin' })
    txLogMonitors.emit('this-does-not-work', { assetName: 'ethereum' })
    await new Promise(setImmediate)

    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledWith({
      ethereum: true,
    })
    handler.mockReset()

    txLogMonitors.emit('custom-restore-event', { assetName: 'ethereum' })
    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledWith({})
  })

  test('wait second tick when unknown tokens added', async () => {
    const { module, txLogMonitors, restoringAssetsAtom } = setup()
    const handler = jest.fn()
    restoringAssetsAtom.observe(handler)
    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledTimes(1)

    await module.restoreAll()

    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenCalledWith({
      bitcoin: true,
      ethereum: true,
    })

    handler.mockReset()

    txLogMonitors.emit('unknown-tokens', { baseAssetName: 'ethereum' })
    txLogMonitors.emit('after-tick-multiple-wallet-accounts', { assetName: 'ethereum' })
    await new Promise(setImmediate)
    const restoringAssets = await restoringAssetsAtom.get()
    expect(restoringAssets.ethereum).toEqual(true)
    txLogMonitors.emit('after-tick-multiple-wallet-accounts', { assetName: 'ethereum' })
    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledWith({
      bitcoin: true,
    })
  })
})
