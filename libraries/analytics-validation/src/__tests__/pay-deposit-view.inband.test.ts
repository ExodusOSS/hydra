import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayDepositView',
    properties: {
      ...commonProps,
      deposit_type: 'bank',
      payment_provider: 'XO Pay',
    },
  },
  {
    event: 'PayDepositView',
    properties: {
      ...commonProps,
      deposit_type: 'mastercard',
      payment_provider: 'Moonpay',
    },
  },
]

describe('PayDepositView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayDepositView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayDepositView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayDepositView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid types', () => {
    expect(() =>
      validate({
        event: 'PayDepositView',
        properties: {
          ...commonProps,
          deposit_type: 123,
          payment_provider: 'XO Pay',
        },
      })
    ).toThrow()
  })
})
