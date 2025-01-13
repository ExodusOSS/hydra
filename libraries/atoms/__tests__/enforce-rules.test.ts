import delay from 'delay'
import type { Storage } from '@exodus/storage-interface'

jest.doMock('proxy-freeze', () => (obj: any) => ({
  ...obj,
  _freezes: (obj._freezes || 0) + 1,
}))

const { createInMemoryAtom } = await import('../src/index.js')
const { default: enforceObservableRules } = await import('../src/enforce-rules.js')
const { createStorageAtomFactory } = await import('../src/index.js')

describe('enforceObservableRules', () => {
  it('should not double freeze', async () => {
    expect.assertions(1)
    const identityAtom = createInMemoryAtom({
      defaultValue: { alterEgo: 'Batman', name: 'Bruce Wayne' },
    })

    await new Promise<void>((resolve, reject) =>
      identityAtom.observe((value: any) => {
        try {
          expect(value._freezes).toEqual(1)
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    )
  })

  it('should not emit same non-primitive values if observe`s callback triggered in a while after get', (done) => {
    const sameValue = [1, 2]
    const atomWithObserveLaterThanGet = enforceObservableRules({
      defaultValue: [],
      get: async () => sameValue,
      observe: (listener) => {
        setTimeout(() => listener(sameValue), 50)

        return () => null
      },
      set: async () => {},
    })

    const listenerMock = jest.fn()

    atomWithObserveLaterThanGet.observe(listenerMock)

    setTimeout(() => {
      expect(listenerMock).toBeCalledTimes(1)
      done()
    }, 100)
  })

  it('should call listener with defaultValue on reset', async () => {
    const defaultValue = { alterEgo: 'Batman', name: 'Bruce Wayne' }
    const atom = createInMemoryAtom({ defaultValue })

    await atom.set({ alterEgo: 'Superman', name: 'Clark Kent' })

    const handler = jest.fn()
    atom.observe(handler)

    await atom.reset()

    expect(handler).toHaveBeenCalledWith(expect.objectContaining(defaultValue))
  })

  it('should ignore get request if its finished after unsubscribe', async () => {
    const state: Record<string, any> = {}
    const storage = {
      get: async (key: string) => delay(10).then(() => state[key]),
      set: async (key: string, value: any) => {
        state[key] = value
      },
    } as unknown as Storage

    const atom = createStorageAtomFactory({ storage })({
      key: 'random',
      defaultValue: 1,
    })

    const listener = jest.fn()

    const unsubscribe = atom.observe(listener) // initialize get request

    unsubscribe()

    await atom.get()

    expect(listener).toBeCalledTimes(0)
  })
})
