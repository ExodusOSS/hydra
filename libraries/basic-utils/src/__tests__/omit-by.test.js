import { omitBy } from '../lodash.js'

describe('omitBy', () => {
  const object = { bruce: 'Doe', john: 'Wayne', joker: 'Doe' }

  it('should require predicate', () => {
    expect(() => omitBy(object)).toThrow(/Function/)
    expect(() => omitBy(object, ['abc'])).toThrow(/Function/)
  })

  it('should omit by value matching predicate', () => {
    expect(omitBy(object, (value) => value.startsWith('D'))).toEqual({ john: 'Wayne' })
  })

  it('should omit by key matching predicate', () => {
    expect(omitBy(object, (value, key) => key.startsWith('j'))).toEqual({
      bruce: 'Doe',
    })
  })

  it('should return an empty object when `object` is nullish', function () {
    expect(omitBy(null, () => true)).toEqual({})
    expect(omitBy(undefined, () => true)).toEqual({})
  })
})
