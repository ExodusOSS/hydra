import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayWithdrawAddressView',
    properties: {
      ...commonProps,
      token_type: 'stablecoin',
    },
  },
  {
    event: 'PayWithdrawAddressView',
    properties: {
      ...commonProps,
      token_type: 'crypto',
    },
  },
]

describe('PayWithdrawAddressView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayWithdrawAddressView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayWithdrawAddressView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayWithdrawAddressView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid token_type type', () => {
    expect(() =>
      validate({
        event: 'PayWithdrawAddressView',
        properties: {
          ...commonProps,
          token_type: 123,
        },
      })
    ).toThrow()
  })

  it('Should reject invalid token_type value', () => {
    expect(() =>
      validate({
        event: 'PayWithdrawAddressView',
        properties: {
          ...commonProps,
          token_type: 'invalid',
        },
      })
    ).toThrow()
  })
})
