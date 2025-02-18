import type { Atom } from '../../src/index.js'
import { createInMemoryAtom } from '../../src/index.js'

describe('createInMemoryAtom', () => {
  describe('without default', () => {
    let identityAtom: Atom<string | undefined>

    beforeEach(() => {
      identityAtom = createInMemoryAtom()
    })

    it('should block get until a value is set', (done) => {
      expect.assertions(1)

      void identityAtom.get().then((value) => {
        expect(value).toEqual('Bruce Wayne')
        done()
      })

      void identityAtom.set('Bruce Wayne')
    })

    it('should call observe only after value is set', (done) => {
      expect.assertions(2)

      const subscriber = jest.fn()
      identityAtom.observe(subscriber)

      void identityAtom.get().then(() => {
        expect(subscriber).toHaveBeenCalledTimes(1)
        expect(subscriber).toHaveBeenCalledWith('Bruce Wayne')
        done()
      })

      void identityAtom.set('Bruce Wayne')
    })

    it('should not call observe until any non-undefined value set', async () => {
      expect.assertions(3)

      const subscriber = jest.fn()
      identityAtom.observe(subscriber)
      await new Promise(setImmediate)
      expect(subscriber).toBeCalledTimes(0)
      void identityAtom.set(undefined)
      await new Promise(setImmediate)
      expect(subscriber).toBeCalledTimes(0)

      void identityAtom.set('Bruce Wayne')
      await new Promise(setImmediate)
      expect(subscriber).toBeCalledTimes(1)
    })

    it('should allow using set with callback', async () => {
      await identityAtom.set(() => 'No one')
      await expect(identityAtom.get()).resolves.toEqual('No one')
    })
  })

  describe('with default', () => {
    it('should allow undefined as default', async () => {
      const identityAtom = createInMemoryAtom({ defaultValue: undefined })

      const value = await identityAtom.get()
      expect(value).toBeUndefined()
    })
  })
})
