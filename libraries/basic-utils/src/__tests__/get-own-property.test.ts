import { getOwnProperty } from '../get-own-property.js'

const object = {
  1: 'ABC',
  secondFiled: 10,
  thirdField: { name: 'I am an object' },
  forthField: () => {
    console.log('hello')
  },
}

describe('get-own-property', () => {
  test('cannot return when invalid object', () => {
    expect(getOwnProperty(undefined, '1')).toEqual(undefined)
    expect(getOwnProperty(null, 1)).toEqual(undefined)
    expect(getOwnProperty('someString', 'key', 'string')).toEqual(undefined)
    expect(getOwnProperty(123, 'key', 'string')).toEqual(undefined)
    expect(getOwnProperty({}, 'key', 'string')).toEqual(undefined)
  })

  test('can return 1', () => {
    expect(getOwnProperty(object, '1')).toEqual(object[1])
    expect(getOwnProperty(object, 1)).toEqual(object[1])
    expect(getOwnProperty(object, 1, 'string')).toEqual(object[1])
    expect(() => getOwnProperty(object, 1, 'number')).toThrow(
      'Unexpected type for key 1, expected number but got string'
    )
  })

  test('can return secondFiled', () => {
    const key = 'secondFiled'
    expect(getOwnProperty(object, key)).toEqual(object.secondFiled)
    expect(getOwnProperty(object, key, 'number')).toEqual(object.secondFiled)
    expect(() => getOwnProperty(object, key, 'object')).toThrow(
      'Unexpected type for key secondFiled, expected object but got number'
    )
  })

  test('can return thirdField', () => {
    const key = 'thirdField'
    expect(getOwnProperty(object, key)).toEqual(object.thirdField)
    expect(getOwnProperty(object, key, 'object')).toEqual(object.thirdField)
    expect(() => getOwnProperty(object, key, 'number')).toThrow(
      'Unexpected type for key thirdField, expected number but got object'
    )
  })

  test('can return forthField', () => {
    const key = 'forthField'
    expect(getOwnProperty(object, key)).toEqual(object.forthField)
    expect(getOwnProperty(object, key, 'function')).toEqual(object.forthField)
    expect(() => getOwnProperty(object, key, 'number')).toThrow(
      'Unexpected type for key forthField, expected number but got function'
    )
  })

  test('can not return toString', () => {
    expect(object.toString).toEqual(expect.any(Function))
    expect(getOwnProperty(object, 'toString')).toEqual(undefined)
    expect(getOwnProperty(object, 'toString', 'function')).toEqual(undefined)
  })
})
