import { createInMemoryAtom } from '@exodus/atoms'
import EventEmitter from 'events' // eslint-disable-line @exodus/restricted-imports/no-node-core-events

import marketHistoryLifecyclePluginDefinition from '..'

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

  test('should start if no app process atom passed', async () => {
    plugin = createPlugin({ marketHistoryMonitor, marketHistoryAtom, port })

    expect(plugin.onStart).not.toThrow()
  })

  test('should not update market history when start', async () => {
    await plugin.onStart()

    expect(marketHistoryMonitor.start).not.toHaveBeenCalled()
  })

  test('should update market history when app coming back from background', async () => {
    await plugin.onStart()

    await appProcessAtom.set({ mode: 'background' })
    await appProcessAtom.set({ mode: 'active' })

    expect(marketHistoryMonitor.start).toHaveBeenCalled()
  })

  test('should call monitor.stop when app going to background', async () => {
    await plugin.onStart()

    await appProcessAtom.set({ mode: 'active' })
    await appProcessAtom.set({ mode: 'background' })

    expect(marketHistoryMonitor.stop).toHaveBeenCalled()
  })
})
