import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayPayAmountView',
    properties: {
      ...commonProps,
      receiver_account_type: 'bank',
    },
  },
  {
    event: 'PayPayAmountView',
    properties: {
      ...commonProps,
      receiver_account_type: 'exodus-pay-user',
    },
  },
]

describe('PayPayAmountView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayPayAmountView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayPayAmountView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayPayAmountView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid receiver_account_type type', () => {
    expect(() =>
      validate({
        event: 'PayPayAmountView',
        properties: {
          ...commonProps,
          receiver_account_type: 123,
        },
      })
    ).toThrow()
  })
})
