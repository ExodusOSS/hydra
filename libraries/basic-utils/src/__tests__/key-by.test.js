import { keyBy } from '../lodash.js'

describe('keyBy', function () {
  it('throws if key is neither string or function', () => {
    expect(() => keyBy([], 1)).toThrow(/string or keying function/)
  })

  it('throws if key is prototype key', () => {
    expect(() => keyBy([], '__proto__')).toThrow(/prototype key/)
  })

  it('throws if value referenced by key is prototype key', () => {
    const arr = [{ id: '__proto__' }]
    expect(() => keyBy(arr, 'id')).toThrow(/prototype key/)
  })

  it('throws if keying function returns prototype key', () => {
    const arr = [{ id: 1 }]
    const fn = () => '__proto__'
    expect(() => keyBy(arr, fn)).toThrow(/prototype key/)
  })

  it('keys by string key', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }]
    expect(keyBy(arr, 'id')).toEqual({
      1: { id: 1 },
      2: { id: 2 },
      3: { id: 3 },
    })
  })

  it('keys by keying function', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }]
    expect(keyBy(arr, (obj) => obj.id)).toEqual({
      1: { id: 1 },
      2: { id: 2 },
      3: { id: 3 },
    })
  })
})
