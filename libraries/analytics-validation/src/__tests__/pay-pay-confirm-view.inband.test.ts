import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayPayConfirmView',
    properties: {
      ...commonProps,
      receiver_account_type: 'bank',
      amount_usd: 100.5,
    },
  },
  {
    event: 'PayPayConfirmView',
    properties: {
      ...commonProps,
      receiver_account_type: 'exodus-pay-user',
      amount_usd: 25,
    },
  },
]

describe('PayPayConfirmView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayPayConfirmView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayPayConfirmView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayPayConfirmView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid receiver_account_type type', () => {
    expect(() =>
      validate({
        event: 'PayPayConfirmView',
        properties: {
          ...commonProps,
          receiver_account_type: 123,
          amount_usd: 100,
        },
      })
    ).toThrow()
  })

  it('Should reject invalid amount_usd type', () => {
    expect(() =>
      validate({
        event: 'PayPayConfirmView',
        properties: {
          ...commonProps,
          receiver_account_type: 'bank',
          amount_usd: '100',
        },
      })
    ).toThrow()
  })
})
