import { connectAssets } from '@exodus/assets'
import _assets from '@exodus/assets-base'
import { createInMemoryAtom } from '@exodus/atoms'
import createIocContainer from '@exodus/dependency-injection'
import preprocess from '@exodus/dependency-preprocessors'
// rename dependencies, e.g. from a global 'marketHistoryRefreshIntervalAtom' implementation id
// to a 'refreshIntervalAtom' interface id declared in the module's dependencies
import alias from '@exodus/dependency-preprocessors/src/preprocessors/alias.js'
// auto-inject config from config.restoreProgressTracker when 'config' is listed in dependencies
import config from '@exodus/dependency-preprocessors/src/preprocessors/config.js'
// auto-inject logger when 'logger' is listed in dependencies
import logify from '@exodus/dependency-preprocessors/src/preprocessors/logify.js'
import createInMemoryStorage from '@exodus/storage-memory'
import EventEmitter from 'events/events.js'

import { restoringAssetsAtomDefinition } from '../../atoms/index.js'
import restoreProgressTrackerDefinition from '../index.js'

const createLogger = (namespace) => console

const assets = connectAssets(_assets)

const createAssetsModule = () =>
  Object.assign(new EventEmitter(), {
    getAssets: () => assets,
    getAsset: (assetName) => assets[assetName],
  })

const defaultConfig = {
  monitorEvents: ['after-tick-multiple-wallet-accounts', 'after-restore'],
}

describe('restore-progress-tracker examples', () => {
  const setup = (config = {}) => {
    const storage = createInMemoryStorage()
    const assetsModule = createAssetsModule()
    const restoringAssetsAtom = restoringAssetsAtomDefinition.factory({ storage })
    const baseAssetNamesToMonitorAtom = createInMemoryAtom({
      defaultValue: ['bitcoin', 'ethereum'],
    })
    const availableAssetNamesAtom = createInMemoryAtom({
      defaultValue: ['bitcoin', 'ethereum'],
    })
    const txLogMonitors = new EventEmitter()
    const module = restoreProgressTrackerDefinition.factory({
      assetsModule,
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
      assetsModule,
    }
  }

  it('initializes restore-progress-tracker with vanilla construction', () => {
    expect(setup).not.toThrow()
  })

  it('initializes restore-progress-tracker via ioc', () => {
    const ioc = createIocContainer({ logger: console })
    const deps = preprocess({
      dependencies: [
        {
          definition: {
            id: 'logger',
            factory: () => createLogger(''),
            public: true,
          },
        },
        {
          definition: {
            id: 'storage',
            factory: createInMemoryStorage,
            public: true,
          },
        },
        {
          definition: {
            id: 'config',
            factory: () => ({
              restoreProgressTracker: {
                monitorEvents: ['after-tick-multiple-wallet-accounts', 'after-restore'],
              },
            }),
            public: true,
          },
        },
        {
          definition: {
            id: 'assetsModule',
            factory: createAssetsModule,
            public: true,
          },
        },
        {
          definition: {
            id: 'availableAssetNamesAtom',
            factory: createInMemoryAtom,
            public: true,
          },
        },
        {
          definition: {
            id: 'baseAssetNamesToMonitorAtom',
            factory: createInMemoryAtom,
            public: true,
          },
        },
        {
          definition: {
            id: 'txLogMonitors',
            factory: () => new EventEmitter(),
            public: true,
          },
        },
        { definition: restoringAssetsAtomDefinition },
        { definition: restoreProgressTrackerDefinition },
      ],
      preprocessors: [
        //
        logify({ createLogger }),
        config(),
        alias(),
      ],
    })

    ioc.registerMultiple(deps)
    ioc.resolve()

    const { restoreProgressTracker } = ioc.getAll()
    expect(restoreProgressTracker.restoreAll).toBeDefined()
    expect(restoreProgressTracker.restoreAsset).toBeDefined()
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
    await availableAssetNamesAtom.set(['bitcoin', 'ethereum', 'aave'])
    const handler = jest.fn()
    restoringAssetsAtom.observe(handler)
    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledTimes(1)

    module.restoreAll()

    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenCalledWith({
      bitcoin: true,
      ethereum: true,
      aave: true,
    })

    handler.mockReset()
    txLogMonitors.emit('after-tick-multiple-wallet-accounts', { assetName: 'bitcoin' })
    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledWith({
      ethereum: true,
      aave: true,
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
      module.restoreAll()
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

  test('restoreAsset ignores if asset already restoring', async () => {
    const { module, restoringAssetsAtom } = setup()

    const handler = jest.fn()
    restoringAssetsAtom.observe(handler)

    const initialRestore = async () => {
      module.restoreAll()
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

  test('wait second tick when unknow tokens added', async () => {
    const { module, txLogMonitors, restoringAssetsAtom } = setup()
    const handler = jest.fn()
    restoringAssetsAtom.observe(handler)
    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledTimes(1)

    module.restoreAll()

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
