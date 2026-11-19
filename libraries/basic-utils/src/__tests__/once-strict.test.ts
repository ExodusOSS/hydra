import { onceStrict } from '../once-strict.js'

describe('onceStrict', () => {
  it('calls the function only once', () => {
    const fn = jest.fn(() => 42)
    const wrapped = onceStrict(fn)

    wrapped()
    wrapped()
    wrapped()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('returns the result of the first call on every subsequent call', () => {
    const obj = { value: 42 }
    const wrapped = onceStrict(() => obj)

    expect(wrapped()).toBe(obj)
    expect(wrapped()).toBe(obj)
  })

  it('works when the function returns a falsy value', () => {
    for (const falsyValue of [null, 0, false, ''] as const) {
      const fn = jest.fn(() => falsyValue)
      const wrapped = onceStrict(fn)

      expect(wrapped()).toBe(falsyValue)
      expect(wrapped()).toBe(falsyValue)
      expect(fn).toHaveBeenCalledTimes(1)
    }
  })

  it('preserves the this context', () => {
    const obj = {
      value: 42,
      getValue: onceStrict(function (this: { value: number }) {
        return this.value
      }),
    }

    expect(obj.getValue()).toBe(42)
  })

  it('forwards arguments on the first call', () => {
    const fn = jest.fn((a: number, b: number) => a + b)
    const wrapped = onceStrict(fn)

    expect(wrapped(1, 2)).toBe(3)
    expect(wrapped(99, 99)).toBe(3)
    expect(fn).toHaveBeenCalledWith(1, 2)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('throws a TypeError if the argument is not a function', () => {
    expect(() => onceStrict(42 as any)).toThrow(TypeError)
    expect(() => onceStrict('foo' as any)).toThrow(TypeError)
    expect(() => onceStrict(null as any)).toThrow(TypeError)
  })

  it('calls the function only once even if it throws', () => {
    const fn = jest.fn(() => {
      throw new Error('boom')
    })
    const wrapped = onceStrict(fn)

    expect(() => wrapped()).toThrow('boom')
    expect(() => wrapped()).toThrow('boom')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('rethrows the same error instance on every subsequent call', () => {
    const error = new Error('boom')
    const wrapped = onceStrict(() => {
      throw error
    })

    expect(() => wrapped()).toThrow(error)
    expect(() => wrapped()).toThrow(error)
  })

  it('rethrows even when the thrown value is undefined', () => {
    const wrapped = onceStrict(() => {
      // eslint-disable-next-line no-throw-literal
      throw undefined
    })

    expect(() => wrapped()).toThrow()
    expect(() => wrapped()).toThrow()
  })

  it('throws on re-entrant calls during the first invocation', () => {
    // eslint-disable-next-line prefer-const
    let wrapped: () => number
    const fn = jest.fn((): number => {
      wrapped()
      return 42
    })
    wrapped = onceStrict(fn)

    expect(() => wrapped()).toThrow('onceStrict: re-entrant call detected')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('calls an async function only once and returns the same resolved promise', async () => {
    const fn = jest.fn(async () => 42)
    const wrapped = onceStrict(fn)

    const p1 = wrapped()
    const p2 = wrapped()

    expect(p1).toBe(p2)
    expect(fn).toHaveBeenCalledTimes(1)
    await expect(p1).resolves.toBe(42)
  })

  it('calls an async function only once and returns the same rejected promise', async () => {
    const error = new Error('boom')
    const fn = jest.fn(async () => {
      throw error
    })
    const wrapped = onceStrict(fn)

    const p1 = wrapped()
    const p2 = wrapped()

    expect(p1).toBe(p2)
    expect(fn).toHaveBeenCalledTimes(1)
    await expect(p1).rejects.toThrow(error)
  })
})
