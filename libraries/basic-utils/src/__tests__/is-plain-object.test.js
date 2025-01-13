import { isPlainObject } from '../lodash.js'

describe('isPlainObject', function () {
  it('should detect plain objects', function () {
    function Foo(a) {
      this.a = 1
    }

    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject({ a: 1 })).toBe(true)
    expect(isPlainObject({ constructor: Foo })).toBe(true)
    expect(isPlainObject([1, 2, 3])).toBe(false)
    expect(isPlainObject(new Foo(1))).toBe(false)
  })

  it('should return `true` for objects with a `[[Prototype]]` of `null`', function () {
    const object = Object.create(null)
    expect(isPlainObject(object)).toBe(true)

    object.constructor = Object.prototype.constructor
    expect(isPlainObject(object)).toBe(true)
  })

  it('should return `true` for objects with a `valueOf` property', function () {
    expect(isPlainObject({ valueOf: 0 })).toBe(true)
  })

  it('should return `false` for objects with a custom `[[Prototype]]`', function () {
    const object = Object.create({ a: 1 })
    expect(isPlainObject(object)).toBe(false)
  })

  it('should return `false` for non-Object objects', function () {
    expect(isPlainObject(arguments)).toBe(false)
    expect(isPlainObject(Error)).toBe(false)
    expect(isPlainObject(Math)).toBe(false)
    expect(isPlainObject(true)).toBe(false)
    expect(isPlainObject('a')).toBe(false)
    expect(isPlainObject(Symbol.toPrimitive)).toBe(false)
  })
})
