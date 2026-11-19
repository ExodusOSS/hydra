import { orderBy } from '../lodash.js'

describe('orderBy', function () {
  const objects = [
    { a: 'x', b: 3 },
    { a: 'y', b: 4 },
    { a: 'x', b: 1 },
    { a: 'y', b: 2 },
  ]

  it('should sort by a single property by a specified order', function () {
    const actual = orderBy(objects, 'a', 'desc')
    expect(actual).toEqual([objects[1], objects[3], objects[0], objects[2]])
  })

  it('should sort by multiple properties by specified orders', function () {
    const actual = orderBy(objects, ['a', 'b'], ['desc', 'asc'])
    expect(actual).toEqual([objects[3], objects[1], objects[2], objects[0]])
  })

  it('should sort by a property in ascending order when its order is not specified', function () {
    const expected = [objects[2], objects[0], objects[3], objects[1]]

    const actual = orderBy(objects, ['a', 'b'])

    expect(actual).toEqual(expected)
  })

  it('should sort by multiple properties where key is a function by specified orders', function () {
    const actual = orderBy(objects, [(data) => data.a, (data) => data.b], ['desc', 'asc'])
    expect(actual).toEqual([objects[3], objects[1], objects[2], objects[0]])
  })
})
