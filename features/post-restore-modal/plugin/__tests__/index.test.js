import postRestoreModalPluginDefinition from '../index'
import { createInMemoryAtom } from '@exodus/atoms'

describe('post-restore-modal plugin', () => {
  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
  })

  test('set shouldShowModalRestoredAtom when conditions are met', async () => {
    const port = { emit: jest.fn() }
    const syncedBalancesAtom = createInMemoryAtom({})
    const balancesAtom = createInMemoryAtom({})
    const shouldShowPostRestoredModalAtom = createInMemoryAtom({})
    const logger = {
      warn: console.warn,
    }
    const restorePlugin = postRestoreModalPluginDefinition.factory({
      port,
      shouldShowPostRestoredModalAtom,
      syncedBalancesAtom,
      balancesAtom,
      logger,
    })

    const handler = jest.fn()
    shouldShowPostRestoredModalAtom.observe(handler)
    expect(handler).toHaveBeenCalledTimes(0)
    restorePlugin.onRestoreCompleted()
    expect(handler).toHaveBeenCalledTimes(0)

    await syncedBalancesAtom.set({
      exodus_0: {
        bitcoin: {
          isZero: false,
        },
      },
    })
    await new Promise(setImmediate)
    // expect(handler).toHaveBeenCalledTimes(1)
    const show = await shouldShowPostRestoredModalAtom.get()
    expect(show).toEqual(true)
  })

  test('set shouldShowModalRestoredAtom when syncedBalancesAtom missing', async () => {
    const port = { emit: jest.fn() }
    const balancesAtom = createInMemoryAtom({})
    const shouldShowPostRestoredModalAtom = createInMemoryAtom({})
    const logger = {
      warn: console.warn,
    }
    const restorePlugin = postRestoreModalPluginDefinition.factory({
      port,
      shouldShowPostRestoredModalAtom,
      balancesAtom,
      logger,
    })

    const handler = jest.fn()
    shouldShowPostRestoredModalAtom.observe(handler)
    expect(handler).toHaveBeenCalledTimes(0)
    restorePlugin.onRestoreCompleted()
    expect(handler).toHaveBeenCalledTimes(0)

    await balancesAtom.set({
      balances: {
        exodus_0: {
          bitcoin: {
            total: {
              isZero: false,
            },
          },
        },
      },
    })
    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledTimes(1)
    const show = await shouldShowPostRestoredModalAtom.get()
    expect(show).toEqual(true)
  })
})
