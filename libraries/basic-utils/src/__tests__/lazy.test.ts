import { lazyFn } from '../lazy.js'

describe('lazyFn', () => {
  it('calls factory only once', () => {
    const innerFn = jest.fn()
    const factory = jest.fn(() => innerFn)
    const fn = lazyFn(factory)

    fn()
    fn()
    fn()

    expect(factory).toHaveBeenCalledTimes(1)
  })

  it('preserves the caller this context', () => {
    const obj = {
      value: 42,
      getValue: lazyFn(
        () =>
          function (this: { value: number }) {
            return this.value
          }
      ),
    }

    expect(obj.getValue()).toBe(42)
  })

  it('calls factory only once even if it throws', () => {
    const error = new Error('factory error')
    const factory = jest.fn((): (() => void) => {
      throw error
    })
    const fn = lazyFn(factory)

    expect(() => fn()).toThrow(error)
    expect(() => fn()).toThrow(error)
    expect(factory).toHaveBeenCalledTimes(1)
  })

  it('rethrows the same error on every subsequent call if factory throws', () => {
    const error = new Error('factory error')
    const fn = lazyFn((): (() => void) => {
      throw error
    })

    expect(() => fn()).toThrow(error)
    expect(() => fn()).toThrow(error)
  })

  it('throws a TypeError if the argument is not a function', () => {
    expect(() => lazyFn(42 as any)).toThrow(TypeError)
    expect(() => lazyFn('foo' as any)).toThrow(TypeError)
    expect(() => lazyFn(null as any)).toThrow(TypeError)
  })

  it('forwards arguments to the produced function on every call', () => {
    const innerFn = jest.fn()
    const fn = lazyFn(() => innerFn)

    fn(1, 2)
    fn(3, 4)

    expect(innerFn).toHaveBeenCalledWith(1, 2)
    expect(innerFn).toHaveBeenCalledWith(3, 4)
    expect(innerFn).toHaveBeenCalledTimes(2)
  })
})
