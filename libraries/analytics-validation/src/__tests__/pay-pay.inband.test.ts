import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayPay',
    properties: {
      ...commonProps,
      receiver_account_type: 'bank',
      amount_usd: 100.5,
      has_note: true,
      success: true,
      was_request: false,
    },
  },
  {
    event: 'PayPay',
    properties: {
      ...commonProps,
      receiver_account_type: 'exodus-pay-user',
      amount_usd: 25,
      has_note: false,
      success: false,
      was_request: true,
    },
  },
]

describe('PayPay', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayPay" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayPay" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayPay" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid types', () => {
    expect(() =>
      validate({
        event: 'PayPay',
        properties: {
          ...commonProps,
          receiver_account_type: 'bank',
          amount_usd: '100',
          has_note: true,
          success: true,
          was_request: false,
        },
      })
    ).toThrow()
  })
})
