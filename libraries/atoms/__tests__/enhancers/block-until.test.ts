import type { Atom } from '../../src/index.js'
import { createInMemoryAtom } from '../../src/index.js'
import blockUntil from '../../src/enhancers/block-until.js'
import type { DeferredPromise } from 'p-defer'
import pDefer from 'p-defer'
import type { Setter } from 'libraries/atoms/src/utils/types'

describe('blockUntil', () => {
  let identityAtom: Atom<string>

  beforeEach(() => {
    identityAtom = createInMemoryAtom({ defaultValue: 'the batman' })
  })

  describe('get', () => {
    let identityAfterLoadAtom: Atom<string>
    let loaded: DeferredPromise<void>

    beforeEach(() => {
      loaded = pDefer()
      identityAfterLoadAtom = blockUntil({ atom: identityAtom, unblock: () => loaded.promise })
    })

    it('should await unblock', async () => {
      loaded.reject(new Error('just making sure this is a awaited'))

      await expect(() => identityAfterLoadAtom.get()).rejects.toThrow(
        'just making sure this is a awaited'
      )
    })

    it('should return value', async () => {
      loaded.resolve()
      const identity = await identityAfterLoadAtom.get()
      expect(identity).toEqual('the batman')
    })
  })

  describe('observe', () => {
    const advance = async (ms: number) => {
      jest.advanceTimersByTime(ms)
      await new Promise(setImmediate)
    }

    beforeEach(() => {
      jest.useFakeTimers({ doNotFake: ['setImmediate'] })
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should only invoke callback once unblock resolves', async () => {
      const timeout42 = new Promise((resolve) => {
        setTimeout(resolve, 42)
      })

      const delayedIdentityAtom = blockUntil({ atom: identityAtom, unblock: () => timeout42 })

      const subscriber = jest.fn()
      delayedIdentityAtom.observe(subscriber)

      await advance(10)
      expect(subscriber).not.toHaveBeenCalled()
      await advance(31)
      expect(subscriber).not.toHaveBeenCalled()
      await advance(1)
      expect(subscriber).toHaveBeenCalledWith('the batman')
    })

    it('should not invoke callback if unsubscribed before unblock resolves', async () => {
      const loaded = pDefer()
      const delayedIdentityAtom = blockUntil({ atom: identityAtom, unblock: () => loaded.promise })

      const subscriber = jest.fn()
      const unsubscribe = delayedIdentityAtom.observe(subscriber)

      unsubscribe()
      loaded.resolve()

      // if this is not here, the test does not fail even if the implementation invokes the callback (aka is broken)
      await new Promise(setImmediate)
      expect(subscriber).not.toHaveBeenCalled()
    })
  })

  describe('set', () => {
    let set: jest.SpyInstance<Promise<void>, [setter: Setter<string>]>

    beforeEach(() => {
      set = jest.spyOn(identityAtom, 'set')
    })

    afterEach(() => {
      set.mockRestore()
    })

    it('should call through to atom', () => {
      const neverRevealIdentityAtom = blockUntil({
        atom: identityAtom,
        unblock: () => pDefer().promise,
      })

      const identity = 'bruce wayne (but you will never find out)'
      neverRevealIdentityAtom.set(identity)

      expect(set).toHaveBeenCalledWith(identity)
    })
  })
})
