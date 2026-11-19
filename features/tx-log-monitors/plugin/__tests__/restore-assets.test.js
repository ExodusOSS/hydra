import { baseAssets } from '@exodus/assets-test-meta'
import { createInMemoryAtom } from '@exodus/atoms'
import EventEmitter from 'events/events.js'

import pluginDefinition from '../restore-assets.js'

describe('restoreAssetsPlugin', () => {
  const { bitcoin } = baseAssets
  const ignoredAssetName = 'asset-to-ignore'

  const advance = async () => {
    await new Promise(setImmediate)
  }

  const setup = () => {
    class RestoreTrackerMock extends EventEmitter {
      restoreAll = jest.fn(() => null)
      clear = jest.fn(() => null)
    }
    const restoreAssetsTracker = new RestoreTrackerMock()
    const port = { emit: jest.fn() }
    const errorTracking = { track: jest.fn() }
    const restoringAssetsAtom = createInMemoryAtom({
      defaultValue: {
        [bitcoin.name]: true,
      },
    })

    const plugin = pluginDefinition.factory({
      restoreAssetsTracker,
      port,
      restoringAssetsAtom,
      config: { assetNamesToNotWait: [ignoredAssetName] },
      errorTracking,
    })

    return {
      plugin,
      restoreAssetsTracker,
      port,
      restoringAssetsAtom,
      errorTracking,
    }
  }

  test('plugin returns needed functions', () => {
    const { plugin } = setup()

    expect(typeof plugin.onRestore).toEqual('function')
    expect(typeof plugin.onImport).toEqual('function')
    expect(typeof plugin.onClear).toEqual('function')
    expect(typeof plugin.onStart).toEqual('function')
  })

  test('plugin resolves onRestore after restore tracker finishes onImport', async () => {
    const { plugin, restoringAssetsAtom } = setup()
    await restoringAssetsAtom.set({ ethereum: true })

    await plugin.onImport()
    const waitingRestorePromise = plugin.onRestore()
    const handler = jest.fn()
    void waitingRestorePromise.then(handler)

    await advance()
    expect(handler).toHaveBeenCalledTimes(0)

    await restoringAssetsAtom.set({})

    await advance()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('plugin resolves onRestore after restore tracker finishes onImport and app started in non-restoring state', async () => {
    const { plugin, restoringAssetsAtom } = setup()
    await plugin.onStart({ isRestoring: false })
    await restoringAssetsAtom.set({ ethereum: true })
    await plugin.onImport()
    const waitingRestorePromise = plugin.onRestore()
    const handler = jest.fn()
    void waitingRestorePromise.then(handler)

    await advance()
    expect(handler).toHaveBeenCalledTimes(0)

    await restoringAssetsAtom.set({})

    await advance()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('plugin resolves onRestore after restore tracker finished onStart', async () => {
    const { plugin, restoringAssetsAtom } = setup()
    await restoringAssetsAtom.set({ ethereum: true })

    await plugin.onStart({ isRestoring: true })
    const waitingRestorePromise = plugin.onRestore()
    const handler = jest.fn()
    void waitingRestorePromise.then(handler)

    await advance()
    expect(handler).toHaveBeenCalledTimes(0)

    await restoringAssetsAtom.set({})

    await advance()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('plugin resolves onRestore when app starts restoring', async () => {
    const { plugin, restoringAssetsAtom } = setup()
    await restoringAssetsAtom.set({ ethereum: true })

    await plugin.onImport()
    const waitingRestorePromise = plugin.onRestore()
    const handler = jest.fn()
    void waitingRestorePromise.then(handler)

    await advance()
    expect(handler).toHaveBeenCalledTimes(0)
    await plugin.onStart({ isRestoring: true })

    await advance()
    expect(handler).toHaveBeenCalledTimes(0)

    await restoringAssetsAtom.set({})

    await advance()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('plugin resolves onRestore when app starts restoring and import hook called later', async () => {
    const { plugin, restoringAssetsAtom } = setup()
    await restoringAssetsAtom.set({ ethereum: true })
    await plugin.onStart({ isRestoring: true })

    const waitingRestorePromise = plugin.onRestore()
    const handler = jest.fn()
    void waitingRestorePromise.then(handler)

    await advance()
    expect(handler).toHaveBeenCalledTimes(0)

    await plugin.onImport()
    await advance()
    expect(handler).toHaveBeenCalledTimes(0)

    await restoringAssetsAtom.set({})

    await advance()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('should ignore configured assets during restoreAll process', async () => {
    const { plugin, restoringAssetsAtom } = setup()
    plugin.onStart({ isRestoring: true })

    await restoringAssetsAtom.set({ ethereum: true, [ignoredAssetName]: true })

    const waitingRestorePromise = plugin.onRestore()

    const handler = jest.fn()
    void waitingRestorePromise.then(handler)

    await advance()
    expect(handler).toHaveBeenCalledTimes(0)

    await restoringAssetsAtom.set({ [ignoredAssetName]: true })

    await advance()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('resolves onRestore when stopped while restore is in progress', async () => {
    const { plugin, restoringAssetsAtom } = setup()
    await restoringAssetsAtom.set({ ethereum: true })
    await plugin.onStart({ isRestoring: true })

    const handler = jest.fn()
    void plugin.onRestore().then(handler)

    await advance()
    expect(handler).toHaveBeenCalledTimes(0)

    plugin.onStop()
    await advance()

    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('starts restore setup only once when called from both start and import hooks', async () => {
    const { plugin, restoreAssetsTracker } = setup()

    plugin.onStart({ isRestoring: true })
    plugin.onImport()
    plugin.onImport()
    await advance()

    expect(restoreAssetsTracker.restoreAll).toHaveBeenCalledTimes(1)
    expect(restoreAssetsTracker.restoreAll).toHaveBeenCalledWith(false)
  })

  test('restarts restore setup after stop', async () => {
    const { plugin, restoreAssetsTracker } = setup()

    plugin.onImport()
    await advance()

    expect(restoreAssetsTracker.restoreAll).toHaveBeenCalledTimes(1)

    plugin.onStop()
    plugin.onImport()
    await advance()

    expect(restoreAssetsTracker.restoreAll).toHaveBeenCalledTimes(2)
  })

  test('tracks restore setup errors and rejects onRestore', async () => {
    const { plugin, restoreAssetsTracker, errorTracking } = setup()
    const error = new Error('restore setup failed')
    restoreAssetsTracker.restoreAll.mockRejectedValue(error)

    plugin.onImport()
    await advance()
    await advance()

    expect(errorTracking.track).toHaveBeenCalledTimes(1)
    expect(errorTracking.track).toHaveBeenCalledWith({ error })
    await expect(plugin.onRestore()).rejects.toThrow('restore setup failed')
  })
})
