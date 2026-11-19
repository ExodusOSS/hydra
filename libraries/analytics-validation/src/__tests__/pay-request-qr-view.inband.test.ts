import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayRequestQrView',
    properties: {
      ...commonProps,
      amount_usd: 50,
      is_any_amount: false,
    },
  },
  {
    event: 'PayRequestQrView',
    properties: {
      ...commonProps,
      amount_usd: null,
      is_any_amount: true,
    },
  },
]

describe('PayRequestQrView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayRequestQrView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayRequestQrView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayRequestQrView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid types', () => {
    expect(() =>
      validate({
        event: 'PayRequestQrView',
        properties: {
          ...commonProps,
          amount_usd: '50',
          is_any_amount: false,
        },
      })
    ).toThrow()
  })
})
