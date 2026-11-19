import findInvalidPrice from '../find-invalid-price.js'

describe('findInvalidPrice', () => {
  it('returns undefined if prices are valid', () => {
    expect(findInvalidPrice([{ close: 0, open: 0, time: 0 }])).toBeUndefined()
    expect(
      findInvalidPrice([
        { close: 0, open: 0, time: 0 },
        { close: 0, open: 0, time: 1 },
      ])
    ).toBeUndefined()
    expect(
      findInvalidPrice([
        { close: 1, open: 1, time: 0 },
        { close: 2, open: 2, time: 1 },
      ])
    ).toBeUndefined()
  })

  it('returns invalid price if price contains non-number values', () => {
    expect(findInvalidPrice([{ close: 'string', open: 0, time: 0 }])).toEqual({
      close: 'string',
      open: 0,
      time: 0,
    })
    expect(findInvalidPrice([{ close: Infinity, open: 0, time: 0 }])).toEqual({
      close: Infinity,
      open: 0,
      time: 0,
    })
    expect(!!findInvalidPrice([{ close: NaN, open: 0, time: 0 }])).toBe(true)
  })

  it('returns true if price is zero but previous value exists', () => {
    expect(
      findInvalidPrice([
        { close: 1, open: 1, time: 0 },
        { close: 0, open: 0, time: 1 },
        { close: 2, open: 2, time: 2 },
      ])
    ).toEqual({ close: 0, open: 0, time: 1 })
    expect(
      findInvalidPrice([
        { close: 1, open: 1, time: 0 },
        { close: 2, open: 2, time: 2 },
        { close: 0, open: 0, time: 1 },
      ])
    ).toEqual({ close: 0, open: 0, time: 1 })
    expect(
      !!findInvalidPrice([
        { close: 1, open: 1, time: 0 },
        { close: NaN, open: null, time: 2 },
        { close: 0, open: 0, time: 1 },
      ])
    ).toBe(true)
    expect(
      !!findInvalidPrice([
        { close: 1, open: 1, time: 0 },
        { close: 2, open: 2, time: 2 },
        { close: null, open: NaN, time: 1 },
      ])
    ).toBe(true)
  })

  it('should return invalid price if it zero but previous cache contains something', () => {
    expect(
      findInvalidPrice([{ close: 0, open: 0, time: 1 }], {
        close: 1,
        open: 1,
        time: 0,
      })
    ).toEqual({ close: 0, open: 0, time: 1 })
  })
})
