import { connectAssets } from '@exodus/assets'
import assetsBase from '@exodus/assets-base'
import { createInMemoryAtom } from '@exodus/atoms'
import { availableAssetsAtomDefinition } from '@exodus/available-assets/atoms'
import { enabledAssetsDifferenceAtomDefinition } from '@exodus/enabled-assets/atoms'
import EventEmitter from 'events/'

import plugin from '../'

const assets = connectAssets(assetsBase)

describe('tx-log-monitor plugin', () => {
  const advance = async (ms) => {
    jest.advanceTimersByTime(ms)
    await new Promise(setImmediate)
  }

  let txLogMonitors
  let assetsModule
  let walletAccounts
  let enabledAssetsDifferenceAtom
  let enabledAssetsAtom
  let logger
  let availableAssetsAtom

  const setup = () =>
    plugin.factory({
      txLogMonitors,
      assetsModule,
      walletAccounts,
      enabledAssetsDifferenceAtom,
      logger,
      availableAssetsAtom,
    })

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })

    enabledAssetsAtom = createInMemoryAtom({ defaultValue: {} })
    logger = {
      warn: jest.fn(),
    }
    txLogMonitors = new (class extends EventEmitter {
      start = jest.fn()
      stop = jest.fn(() => new Promise((resolve) => resolve()))
      update = jest.fn()
    })()
    assetsModule = {
      addTokens: jest.fn(),
      getAssets: () => assets,
      getBaseAssetNames: () =>
        Object.keys(assets, (assetName) => assetName === assets[assetName].baseAsset.name),
    }
    walletAccounts = {
      awaitSynced: jest.fn(() => true),
    }
    enabledAssetsDifferenceAtom = enabledAssetsDifferenceAtomDefinition.factory({
      enabledAssetsAtom,
    })
    availableAssetsAtom = availableAssetsAtomDefinition.factory({
      config: {
        defaultAvailableAssetNames: [],
      },
    })
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  test('starts after unlock and waiting fusion', async () => {
    enabledAssetsDifferenceAtom = createInMemoryAtom({})
    const instance = setup()
    instance.onUnlock()
    expect(walletAccounts.awaitSynced).toBeCalled()
    await advance()
    expect(txLogMonitors.start).toBeCalledTimes(1)

    instance.onUnlock()
    await advance()
    expect(txLogMonitors.start).toBeCalledTimes(2)
  })

  test('starts after unlock on timeout if fusion not resolved', async () => {
    walletAccounts = {
      awaitSynced: jest.fn(() => new Promise((resolve) => setTimeout(resolve, 11_000))),
    }
    const instance = setup()
    instance.onUnlock()
    expect(walletAccounts.awaitSynced).toBeCalled()
    await advance()
    expect(txLogMonitors.start).toHaveBeenCalledTimes(0)
    await advance(10_000)
    expect(txLogMonitors.start).toHaveBeenCalledTimes(1)
  })

  test('stop monitor on stop', () => {
    const instance = setup()
    instance.onStop()
    expect(txLogMonitors.stop).toHaveBeenCalledTimes(1)
  })

  test('stop monitor on lock', () => {
    const instance = setup()
    instance.onLock()
    expect(txLogMonitors.stop).toHaveBeenCalledTimes(1)
  })
  test('after restore finished observe enabled assets and refresh monitor for them', async () => {
    const instance = setup()
    await enabledAssetsAtom.set({
      bitcoin: true,
    })
    instance.onUnlock()
    await advance()
    instance.onAssetsSynced()
    await advance()
    await enabledAssetsAtom.set({
      bitcoin: true,
      ethereum: true,
    })
    await advance()
    expect(txLogMonitors.update).toHaveBeenCalledWith({ assetName: 'ethereum' })
  })

  test('after start react on available assets change and try to refresh monitor for base assets when new token added', async () => {
    const instance = setup()
    await availableAssetsAtom.set([
      {
        bitcoin: true,
        reason: 'assets-load',
      },
    ])
    instance.onStart()
    await advance()
    await availableAssetsAtom.set([
      {
        assetName: 'bitcoin',
        reason: 'assets-load',
      },
      {
        assetName: 'ethereum',
        reason: 'assets-add',
      },
      {
        assetName: 'tronmainnet',
        reason: 'assets-update',
      },
    ])
    await advance()
    expect(txLogMonitors.update).toHaveBeenCalledWith({ assetName: 'ethereum', refresh: true })
    expect(txLogMonitors.update).toHaveBeenCalledWith({ assetName: 'tronmainnet', refresh: true })
  })

  test('ignore refreshing enabled asset if it was just added to available list', async () => {
    const instance = setup()
    await availableAssetsAtom.set([
      {
        bitcoin: true,
        reason: 'assets-load',
      },
    ])
    // simulate default enabled assets
    await enabledAssetsAtom.set({
      ethereum: true,
    })

    instance.onStart()

    await advance()
    await availableAssetsAtom.set([
      {
        assetName: 'bitcoin',
        reason: 'assets-load',
      },
      {
        assetName: 'tronmainnet',
        reason: 'assets-add',
      },
    ])
    await advance()

    expect(txLogMonitors.update).toHaveBeenCalledWith({ assetName: 'tronmainnet', refresh: true })
    expect(txLogMonitors.update).toHaveBeenCalledTimes(1)
    instance.onAssetsSynced()
    await advance()
    await enabledAssetsAtom.set({
      ethereum: true,
      tronmainnet: true,
    })
    await advance()
    expect(txLogMonitors.update).toHaveBeenCalledTimes(1)
    await enabledAssetsAtom.set({
      ethereum: true,
    })
    await advance()
    expect(txLogMonitors.update).toHaveBeenCalledTimes(1)
    await enabledAssetsAtom.set({
      ethereum: true,
      tronmainnet: true,
    })
    await advance()
    expect(txLogMonitors.update).toHaveBeenCalledTimes(2)
  })
})
