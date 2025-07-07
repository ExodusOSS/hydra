import { createInMemoryAtom } from '@exodus/atoms'
import { SynchronizedTime } from '@exodus/basic-utils'
import EventEmitter from 'events/events.js'

import pluginDefinition from '../index.js'

describe('sync-time plugin', () => {
  jest.useFakeTimers({ doNotFake: ['setImmediate'] })

  test('should start and stop', async () => {
    const syncTimeAtom = createInMemoryAtom({
      defaultValue: {
        time: Date.now(),
        startOfHour: Date.now(),
      },
    })

    const handler = jest.fn()
    const port = new EventEmitter()
    port.on('syncTime', handler)

    const plugin = pluginDefinition.factory({
      config: {
        interval: 1000,
      },
      syncTimeAtom,
      port,
      synchronizedTime: SynchronizedTime,
    })

    expect(handler).toBeCalledTimes(0)

    plugin.onLoad()
    expect(handler).toBeCalledTimes(1)

    await jest.advanceTimersByTimeAsync(1000)
    expect(handler).toBeCalledTimes(2)

    await jest.advanceTimersByTimeAsync(1000)
    expect(handler).toBeCalledTimes(3)

    plugin.onStop()
    expect(handler).toBeCalledTimes(3)

    await jest.advanceTimersByTimeAsync(1000)
    expect(handler).toBeCalledTimes(3)
  })
})
