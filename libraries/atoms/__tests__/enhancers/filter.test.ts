import type { Atom } from '../../src/index.js'
import { createInMemoryAtom, filter } from '../../src/index.js'

describe('filter', () => {
  let baseAtom: Atom<string>
  let batmansIdentity: Atom<string>

  beforeAll(() => {
    jest.useFakeTimers()
  })

  beforeEach(() => {
    baseAtom = createInMemoryAtom({ defaultValue: 'Bruce Wayne' })
    batmansIdentity = filter(baseAtom, (value) => value !== 'Bruce Wayne') // we have to make sure no one knows who batman is
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('get', () => {
    test('only resolves values matching predicate ', async () => {
      let identity: string | undefined

      setTimeout(() => {
        batmansIdentity.set('Harvey Dent')
      }, 100)

      batmansIdentity.get().then((it) => {
        identity = it
      })

      await jest.advanceTimersByTimeAsync(50)
      expect(identity).toBeUndefined()

      await jest.advanceTimersByTimeAsync(50)
      expect(identity).toBe('Harvey Dent')
    })

    test('only subscribes to base atom once', async () => {
      const handler = jest.fn()

      jest.spyOn(baseAtom, 'observe')

      setTimeout(() => {
        batmansIdentity.set('Harvey Dent')
      }, 100)

      batmansIdentity.get().then(handler)
      batmansIdentity.get().then(handler)
      batmansIdentity.get().then(handler)

      await jest.advanceTimersByTimeAsync(50)
      expect(baseAtom.observe).toHaveBeenCalledTimes(1)

      await jest.advanceTimersByTimeAsync(50)
      expect(handler).toHaveBeenCalledTimes(3)
      expect(handler.mock.calls.every(([identity]) => identity === 'Harvey Dent')).toBe(true)
    })
  })

  describe('observe', () => {
    test('filters values not matching predicate', async () => {
      const handler = jest.fn()
      batmansIdentity.observe(handler)

      await batmansIdentity.set('Harvey Dent')
      expect(handler).toHaveBeenCalledTimes(1)

      await batmansIdentity.set('Bruce Wayne')
      expect(handler).toHaveBeenCalledTimes(1)

      await batmansIdentity.set('The Joker')
      expect(handler).toHaveBeenCalledTimes(2)
      expect(handler.mock.calls.map(([identity]) => identity)).toEqual(['Harvey Dent', 'The Joker'])
    })
  })
})
