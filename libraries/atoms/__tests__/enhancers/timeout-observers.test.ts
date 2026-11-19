import delay from 'delay'

import timeoutObservers from '../../src/enhancers/timeout-observers.js'
import type { Atom, Listener } from '../../src/utils/types.js'

const createTestAtom = <T>(defaultValue: T) => {
  let listener: Listener<T> | undefined

  const atom: Atom<T> = {
    get: async () => defaultValue,
    set: async () => {},
    reset: async () => {},
    observe: (l: Listener<T>) => {
      listener = l
      return () => {
        listener = undefined
      }
    },
  }

  const emit = (value: T) => listener?.(value)

  return { atom, emit }
}

describe('timeoutObservers enhancer', () => {
  it('should not timeout fast observers', async () => {
    const { atom, emit } = createTestAtom('initial')
    const enhanced = timeoutObservers({ atom, timeout: 50 })

    const fastObserver = jest.fn()
    enhanced.observe(fastObserver)

    await emit('updated')
    expect(fastObserver).toHaveBeenCalledWith('updated')
  })

  it('should reject when observer exceeds timeout', async () => {
    const { atom, emit } = createTestAtom('initial')
    const enhanced = timeoutObservers({ atom, timeout: 10 })

    const slowObserver = jest.fn(async () => {
      await delay(50)
    })

    enhanced.observe(slowObserver)

    const result = emit('updated')
    await expect(result).rejects.toThrow('Observer timed out!')
  })

  it('should clear timeout when observer rejects before timeout', async () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

    const { atom, emit } = createTestAtom('initial')
    const enhanced = timeoutObservers({ atom, timeout: 50 })

    const failingObserver = jest.fn(async () => {
      throw new Error('observer error')
    })

    enhanced.observe(failingObserver)

    const result = emit('updated')
    await expect(result).rejects.toThrow('observer error')

    expect(clearTimeoutSpy).toHaveBeenCalled()

    clearTimeoutSpy.mockRestore()
  })

  it('should not hang when observer rejects with a long timeout', async () => {
    const { atom, emit } = createTestAtom('initial')
    const enhanced = timeoutObservers({ atom, timeout: 100_000 })

    const failingObserver = jest.fn(async () => {
      throw new Error('observer error')
    })

    enhanced.observe(failingObserver)

    const result = emit('updated')
    await expect(result).rejects.toThrow('observer error')
  })
})
