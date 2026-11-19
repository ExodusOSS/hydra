import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayProfilePaymentMethodsAdd',
    properties: {
      ...commonProps,
      payment_method_type: 'Apple Pay',
    },
  },
  {
    event: 'PayProfilePaymentMethodsAdd',
    properties: {
      ...commonProps,
      payment_method_type: 'Mastercard',
    },
  },
  {
    event: 'PayProfilePaymentMethodsAdd',
    properties: {
      ...commonProps,
      payment_method_type: 'bank transfer',
    },
  },
]

describe('PayProfilePaymentMethodsAdd', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayProfilePaymentMethodsAdd" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayProfilePaymentMethodsAdd" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayProfilePaymentMethodsAdd" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid payment_method_type type', () => {
    expect(() =>
      validate({
        event: 'PayProfilePaymentMethodsAdd',
        properties: {
          ...commonProps,
          payment_method_type: 123,
        },
      })
    ).toThrow()
  })
})
