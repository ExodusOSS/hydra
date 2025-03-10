import assetBase from '@exodus/assets-base'
import * as atoms from '@exodus/atoms'
import EventEmitter from 'events/'

import pluginDefinition from '..'

jest.mock('@exodus/atoms', () => ({
  ...jest.requireActual('@exodus/atoms'),
  createAtomObserver: jest.fn(),
}))

describe('restoreAssetsPlugin', () => {
  const { bitcoin } = assetBase

  const advance = async () => {
    await new Promise(setImmediate)
  }

  const setup = () => {
    const restoringAssetsAtomObserver = {
      register: jest.fn(),
      unregister: jest.fn(),
      start: jest.fn(),
    }
    atoms.createAtomObserver.mockReturnValue(restoringAssetsAtomObserver)

    class RestoreProgressTracker extends EventEmitter {
      restoreAll = jest.fn(() => null)
    }
    const restoreProgressTracker = new RestoreProgressTracker()
    const port = { emit: jest.fn() }
    const restoringAssetsAtom = atoms.createInMemoryAtom({
      defaultValue: {
        [bitcoin.name]: true,
      },
    })

    const assetsModule = {
      getAssets: jest.fn().mockReturnValue({
        bitcoin: { baseAsset: { name: 'bitcoin' } },
        bitcoin1: { baseAsset: { name: 'bitcoin' } },
        eth: { baseAsset: { name: 'eth' } },
      }),
    }

    const txLogMonitors = {
      updateAll: jest.fn(),
    }

    const plugin = pluginDefinition.factory({
      restoreProgressTracker,
      port,
      restoringAssetsAtom,
      assetsModule,
      txLogMonitors,
      config: { assetNamesToNotWait: ['monero'] },
      errorTracking: {
        track: jest.fn(),
      },
    })

    return {
      plugin,
      restoreProgressTracker,
      port,
      restoringAssetsAtom,
      restoringAssetsAtomObserver,
      txLogMonitors,
    }
  }

  test('should create atom observer and register', () => {
    const { port, restoringAssetsAtom, restoringAssetsAtomObserver } = setup()

    expect(atoms.createAtomObserver).toHaveBeenCalledWith({
      port,
      atom: restoringAssetsAtom,
      event: 'restoringAssets',
    })
    expect(restoringAssetsAtomObserver.register).toHaveBeenCalled()
  })

  test('plugin returns needed functions', () => {
    const { plugin } = setup()

    expect(typeof plugin.onRestore).toEqual('function')
    expect(typeof plugin.onImport).toEqual('function')
    expect(typeof plugin.onClear).toEqual('function')
    expect(typeof plugin.onStart).toEqual('function')
    expect(typeof plugin.onRestoreSeed).toEqual('function')
  })

  test('plugin resolves onRestore after restore progress module finishes onImport', async () => {
    const { plugin, restoringAssetsAtom } = setup()
    await restoringAssetsAtom.set({ ethereum: true })

    await plugin.onImport()
    const waitingRestorePromise = plugin.onRestore()
    const handler = jest.fn()
    waitingRestorePromise.then(handler)

    await advance()
    expect(handler).toHaveBeenCalledTimes(0)

    await restoringAssetsAtom.set({})

    await advance()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('plugin resolves onRestore after restore progress module finishes onImport and app started in non-restoring state', async () => {
    const { plugin, restoringAssetsAtom } = setup()
    await plugin.onStart({ isRestoring: false })
    await restoringAssetsAtom.set({ ethereum: true })
    await plugin.onImport()
    const waitingRestorePromise = plugin.onRestore()
    const handler = jest.fn()
    waitingRestorePromise.then(handler)

    await advance()
    expect(handler).toHaveBeenCalledTimes(0)

    await restoringAssetsAtom.set({})

    await advance()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('plugin resolves onRestore after restore progress module finished onStart', async () => {
    const { plugin, restoringAssetsAtom } = setup()
    await restoringAssetsAtom.set({ ethereum: true })

    await plugin.onStart({ isRestoring: true })
    const waitingRestorePromise = plugin.onRestore()
    const handler = jest.fn()
    waitingRestorePromise.then(handler)

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
    waitingRestorePromise.then(handler)

    await advance()
    expect(handler).toHaveBeenCalledTimes(0)
    await plugin.onStart({ isRestoring: true })

    await advance()
    expect(handler).toHaveBeenCalledTimes(0)

    await restoringAssetsAtom.set({})

    await advance()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('plugin resolves onRestore when app starts restoring and import hook called later ', async () => {
    const { plugin, restoringAssetsAtom } = setup()
    await restoringAssetsAtom.set({ ethereum: true })
    await plugin.onStart({ isRestoring: true })

    const waitingRestorePromise = plugin.onRestore()
    const handler = jest.fn()
    waitingRestorePromise.then(handler)

    await advance()
    expect(handler).toHaveBeenCalledTimes(0)

    await plugin.onImport()
    await advance()
    expect(handler).toHaveBeenCalledTimes(0)

    await restoringAssetsAtom.set({})

    await advance()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('should ignore monero during restoreAll process', async () => {
    const { plugin, restoringAssetsAtom } = setup()
    plugin.onStart({ isRestoring: true })

    await restoringAssetsAtom.set({ ethereum: true, monero: true })

    const waitingRestorePromise = plugin.onRestore()

    const handler = jest.fn()
    waitingRestorePromise.then(handler)

    await advance()
    expect(handler).toHaveBeenCalledTimes(0)

    await restoringAssetsAtom.set({ monero: true })

    await advance()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('should tick monitors for base assets', async () => {
    const { plugin, restoreProgressTracker } = setup()
    plugin.onRestoreSeed()

    expect(restoreProgressTracker.restoreAll).toHaveBeenCalledTimes(1)
    expect(restoreProgressTracker.restoreAll).toHaveBeenCalledWith(true)
  })

  test('defers seed-stored execution until all assets are synchronized', async () => {
    const { plugin, restoringAssetsAtom } = setup()

    await restoringAssetsAtom.set({ ethereum: true })

    const waitingRestorePromise = plugin.onRestoreSeed()

    const handler = jest.fn()
    waitingRestorePromise.then(handler)

    await advance()
    expect(handler).toHaveBeenCalledTimes(0)

    await restoringAssetsAtom.set({})

    await advance()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should start oberserving atom when loaded', () => {
    const { plugin, restoringAssetsAtomObserver } = setup()

    plugin.onLoad()

    expect(restoringAssetsAtomObserver.start).toHaveBeenCalled()
  })

  it('should unobserve atom when stopped', () => {
    const { plugin, restoringAssetsAtomObserver } = setup()

    plugin.onStop()

    expect(restoringAssetsAtomObserver.unregister).toHaveBeenCalled()
  })
})
