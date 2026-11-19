import { createInMemoryAtom } from '@exodus/atoms'

import postRestoreModalPluginDefinition from '../index.js'

describe('post-restore-modal plugin', () => {
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
    void restorePlugin.onRestoreCompleted()
    expect(handler).toHaveBeenCalledTimes(0)

    await syncedBalancesAtom.set({
      exodus_0: {
        bitcoin: {
          isZero: false,
        },
      },
    })
    await new Promise((resolve) => setTimeout(resolve, 0))
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
    void restorePlugin.onRestoreCompleted()
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
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(handler).toHaveBeenCalledTimes(1)
    const show = await shouldShowPostRestoredModalAtom.get()
    expect(show).toEqual(true)
  })
})
