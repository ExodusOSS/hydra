import { set } from '../lodash.js'

describe('set', function () {
  it('should work for nested object when path defined with dots', function () {
    const object = { a: [{ bar: { c: 3 } }] }

    set(object, 'a[0].bar.c', 4)

    expect(object.a[0].bar.c).toEqual(4)
  })

  it('works when path defined as array', function () {
    const object = { a: [{ bar: { c: 3 } }] }
    set(object, ['x', '0', 'y', 'z'], 5)

    expect(object.x[0].y.z).toEqual(5)
  })

  it('works when path defined as array with number', function () {
    const object = { a: [{ bar: { c: 3 } }] }
    set(object, ['x', 0, 'y', 'z'], 5)

    expect(object.x[0].y.z).toEqual(5)
  })

  it('throw on prototype pollution', function () {
    const object = { a: [{ bar: { c: 3 } }] }

    expect(() => set(object, '__proto__.toJSON')).toThrowError('prototype pollution')
  })

  it('returns the passed in object', function () {
    const object = { a: 1 }
    const result = set(object, 'b', 2)
    expect(result).toBe(object)
  })
})
