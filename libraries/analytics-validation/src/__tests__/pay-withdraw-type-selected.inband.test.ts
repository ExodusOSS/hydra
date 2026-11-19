import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayWithdrawTypeSelected',
    properties: {
      ...commonProps,
      token_type: 'bank',
    },
  },
  {
    event: 'PayWithdrawTypeSelected',
    properties: {
      ...commonProps,
      token_type: 'stablecoin',
    },
  },
  {
    event: 'PayWithdrawTypeSelected',
    properties: {
      ...commonProps,
      token_type: 'crypto',
    },
  },
]

describe('PayWithdrawTypeSelected', () => {
  fixtures.forEach((event) => {
    it(`The main schema validates "PayWithdrawTypeSelected" event with token_type "${event.properties.token_type}"`, () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayWithdrawTypeSelected" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayWithdrawTypeSelected" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid "token_type" value', () => {
    expect(() =>
      validate({
        event: 'PayWithdrawTypeSelected',
        properties: {
          ...commonProps,
          token_type: 'invalid_value',
        },
      })
    ).toThrow()
  })

  it('Should reject "token_type" of invalid type', () => {
    expect(() =>
      validate({
        event: 'PayWithdrawTypeSelected',
        properties: {
          ...commonProps,
          token_type: 123,
        },
      })
    ).toThrow()
  })

  it('Should validate all valid "token_type" enum values', () => {
    const validTokenTypes = ['bank', 'stablecoin', 'crypto']
    validTokenTypes.forEach((tokenType) => {
      const validEvent = {
        event: 'PayWithdrawTypeSelected',
        properties: {
          ...commonProps,
          token_type: tokenType,
        },
      }
      expect(validate(validEvent)).toEqual(validEvent)
    })
  })
})
