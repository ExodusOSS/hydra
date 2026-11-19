import { wrap } from '../src/index.js'

describe('wrap', () => {
  test('should run normally function if does not throw', async () => {
    const fn = jest.fn(() => Promise.resolve('harry killed voldy on book 7'))
    const onFailedAttempt = jest.fn()

    const wrapped = wrap(fn, { onFailedAttempt, retries: 1 })

    await wrapped()

    expect(fn).toHaveBeenCalled()
    expect(onFailedAttempt).not.toHaveBeenCalled()
  })

  test('should run attempt function if fn throw', async () => {
    const fn = jest.fn(async () => {
      throw new Error('harry is not supposed to die on book 1')
    })

    const onFailedAttempt = jest.fn(() => Promise.resolve())

    const wrapped = wrap(fn, { onFailedAttempt, retries: 1 })

    await expect(() => wrapped()).rejects.toThrow()

    expect(fn).toHaveBeenCalled()
    expect(onFailedAttempt).toHaveBeenCalled()
  })
})
