import * as atoms from '@exodus/atoms'
import assetBase from '@exodus/assets-base'
import pluginDefinition from '..'
import EventEmitter from 'events/'

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

    expect(typeof plugin.onRestore === 'function').toEqual(true)
    expect(typeof plugin.onImport === 'function').toEqual(true)
    expect(typeof plugin.onClear === 'function').toEqual(true)
    expect(typeof plugin.onStart === 'function').toEqual(true)
    expect(typeof plugin.onRestoreSeed === 'function').toEqual(true)
  })

  test('plugin resolves onRestore after restore progress module finishes onImport', async () => {
    const { plugin, restoreProgressTracker } = setup()

    await plugin.onImport()
    const waitingRestorePromise = plugin.onRestore()
    const handler = jest.fn()
    waitingRestorePromise.then(handler)
    await advance()
    expect(handler).toHaveBeenCalledTimes(0)
    restoreProgressTracker.emit('restored')
    await advance()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('plugin resolves onRestore after restore progress module finished onStart', async () => {
    const { plugin, restoreProgressTracker } = setup()

    await plugin.onStart({ isRestoring: true })
    const waitingRestorePromise = plugin.onRestore()
    const handler = jest.fn()
    waitingRestorePromise.then(handler)
    await advance()
    expect(handler).toHaveBeenCalledTimes(0)
    restoreProgressTracker.emit('restored')
    await advance()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('ticks monitors for base assets', async () => {
    const { plugin, txLogMonitors } = setup()
    plugin.onRestoreSeed()

    expect(txLogMonitors.updateAll).toHaveBeenCalledTimes(1)
    expect(txLogMonitors.updateAll).toHaveBeenNthCalledWith(1)
  })

  test('defers seed-stored execution until all assets are synchronized', async () => {
    const { plugin, restoreProgressTracker } = setup()
    const waitingRestorePromise = plugin.onRestoreSeed()

    const handler = jest.fn()
    waitingRestorePromise.then(handler)

    plugin.onRestoreSeed()

    await advance()
    expect(handler).toHaveBeenCalledTimes(0)

    restoreProgressTracker.emit('restored')
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
