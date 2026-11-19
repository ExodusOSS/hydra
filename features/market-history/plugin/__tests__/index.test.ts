import { createInMemoryAtom } from '@exodus/atoms'
import EventEmitter from 'events' // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/no-node-core-events

import marketHistoryLifecyclePluginDefinition from '../index.js'

const createPlugin = marketHistoryLifecyclePluginDefinition.factory

describe('marketHistoryLifecyclePlugin', () => {
  let plugin
  let marketHistoryMonitor
  let appProcessAtom
  let marketHistoryAtom
  let port
  let errorTracking

  beforeEach(() => {
    marketHistoryAtom = createInMemoryAtom()
    appProcessAtom = createInMemoryAtom({ defaultValue: { mode: 'active' } })
    marketHistoryMonitor = {
      start: jest.fn().mockResolvedValue(),
      stop: jest.fn(),
      hydrate: jest.fn().mockResolvedValue(),
    }
    port = new EventEmitter()
    errorTracking = { track: jest.fn() }

    plugin = createPlugin({
      marketHistoryMonitor,
      marketHistoryAtom,
      appProcessAtom,
      port,
      errorTracking,
    })
  })

  test('should unlock if no app process atom passed', async () => {
    plugin = createPlugin({
      marketHistoryMonitor,
      marketHistoryAtom,
      port,
      errorTracking,
    })

    expect(plugin.onUnlock).not.toThrow()
  })

  test('on start calls hydrate', async () => {
    plugin.onStart()

    expect(marketHistoryMonitor.hydrate).toHaveBeenCalledTimes(1)
  })

  test('on start tracks hydrate errors', async () => {
    const hydrateError = new Error('hydrate boom')
    marketHistoryMonitor.hydrate.mockRejectedValueOnce(hydrateError)

    plugin.onStart()
    await Promise.resolve()
    await Promise.resolve()

    expect(errorTracking.track).toHaveBeenCalledWith({ error: hydrateError, context: 'start' })
  })

  test('on unlock starts once', async () => {
    await plugin.onUnlock()

    expect(marketHistoryMonitor.start).toHaveBeenCalledTimes(1)
  })

  test('should update market history when app coming back from background', async () => {
    await plugin.onUnlock()

    await appProcessAtom.set({ mode: 'background' })
    await appProcessAtom.set({ mode: 'active' })

    expect(marketHistoryMonitor.start).toHaveBeenCalled()
  })

  test('should call monitor.stop when app going to background', async () => {
    await plugin.onUnlock()

    await appProcessAtom.set({ mode: 'active' })
    await appProcessAtom.set({ mode: 'background' })

    expect(marketHistoryMonitor.stop).toHaveBeenCalled()
  })
})
