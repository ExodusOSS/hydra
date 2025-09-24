import isUnitType from '../is-unit-type.js'
import UnitType from '../unit-type.js'

describe('isUnitType', () => {
  it.each([
    {
      case: 'UnitType',
      value: UnitType.create({
        satoshis: 0,
        BTC: 8,
      }),
      expected: true,
    },
    { case: 'object', value: {}, expected: false },
    {
      case: 'unit type like object without methods',
      value: { units: {}, baseUnit: {}, defaultUnit: {} },
      expected: false,
    },
    {
      case: 'unit type like object',
      value: {
        units: {},
        baseUnit: {},
        defaultUnit: {},
        equals: jest.fn(),
        parse: jest.fn(),
        toJSON: jest.fn(),
        ZERO: {},
      },
      expected: true,
    },
    { case: 'string', value: 'not a UnitType', expected: false },
    { case: 'number', value: 42, expected: false },
  ])('should return $expected for $case', ({ value, expected }) => {
    expect(isUnitType(value)).toEqual(expected)
  })
})
