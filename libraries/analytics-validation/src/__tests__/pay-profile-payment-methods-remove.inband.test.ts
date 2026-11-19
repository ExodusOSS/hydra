import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayProfilePaymentMethodsRemove',
    properties: {
      ...commonProps,
      payment_method_type: 'Apple Pay',
    },
  },
  {
    event: 'PayProfilePaymentMethodsRemove',
    properties: {
      ...commonProps,
      payment_method_type: 'bank transfer',
    },
  },
]

describe('PayProfilePaymentMethodsRemove', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayProfilePaymentMethodsRemove" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayProfilePaymentMethodsRemove" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayProfilePaymentMethodsRemove" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid payment_method_type type', () => {
    expect(() =>
      validate({
        event: 'PayProfilePaymentMethodsRemove',
        properties: {
          ...commonProps,
          payment_method_type: 123,
        },
      })
    ).toThrow()
  })
})
