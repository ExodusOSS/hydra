import { createInMemoryAtom } from '@exodus/atoms'
import EventEmitter from 'events' // eslint-disable-line @exodus/restricted-imports/no-node-core-events

import marketHistoryLifecyclePluginDefinition from '../index.js'

const createPlugin = marketHistoryLifecyclePluginDefinition.factory

describe('marketHistoryLifecyclePlugin', () => {
  let plugin
  let marketHistoryMonitor
  let appProcessAtom
  let marketHistoryAtom
  let port

  beforeEach(() => {
    marketHistoryAtom = createInMemoryAtom()
    appProcessAtom = createInMemoryAtom({ defaultValue: { mode: 'active' } })
    marketHistoryMonitor = { start: jest.fn(), stop: jest.fn() }
    port = new EventEmitter()

    plugin = createPlugin({ marketHistoryMonitor, marketHistoryAtom, appProcessAtom, port })
  })

  test('should unlock if no app process atom passed', async () => {
    plugin = createPlugin({ marketHistoryMonitor, marketHistoryAtom, port })

    expect(plugin.onUnlock).not.toThrow()
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
