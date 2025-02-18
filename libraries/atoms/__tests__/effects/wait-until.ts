import waitUntil from '../../src/effects/wait-until.js'
import { createInMemoryAtom } from '../../src/index.js'
import type { Atom, Unsubscribe } from '../../src/utils/types.js'

describe('waitUntil effect', () => {
  let identityAtom: Atom<string>
  let unsubscribe: Unsubscribe
  let observe: (typeof identityAtom)['observe']

  beforeEach(() => {
    unsubscribe = jest.fn()
    identityAtom = createInMemoryAtom({ defaultValue: 'the batman' })
    observe = identityAtom.observe
    jest.spyOn(identityAtom, 'observe').mockImplementation((...args) => {
      observe(...args)
      return unsubscribe
    })
  })

  it('should wait for value to equal supplied value', async () => {
    const handler = jest.fn()
    void waitUntil({ atom: identityAtom, predicate: (v) => v === 'the joker' }).then(handler)

    await identityAtom.set('Harry Potter')
    expect(handler).not.toHaveBeenCalled()

    await identityAtom.set('Batman')
    expect(handler).not.toHaveBeenCalled()

    await identityAtom.set('the joker')
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(handler).toHaveBeenCalled()
    expect(unsubscribe).toHaveBeenCalled()
  })

  it('should not resolve if value not matches', async () => {
    const promise = waitUntil({ atom: identityAtom, predicate: (v) => v === 'the joker' })
    const racePromises = () =>
      Promise.race([
        promise,
        new Promise((resolve, reject) => setTimeout(() => reject(new Error('rejected')), 100)),
      ])

    await expect(racePromises()).rejects.toThrow(/rejected/)

    promise.unobserve()
    expect(unsubscribe).toHaveBeenCalled()
  })

  test('waitUntil rejects after timeout', async () => {
    const start = () =>
      waitUntil({
        atom: identityAtom,
        predicate: (v) => v === 'the joker',
        rejectAfter: 100,
      })

    await expect(start()).rejects.toThrow(/rejected by timeout/)
    expect(unsubscribe).toHaveBeenCalled()
  })
})
