import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayRequestQrShareTap',
    properties: {
      ...commonProps,
      amount_usd: 100,
      is_any_amount: false,
    },
  },
  {
    event: 'PayRequestQrShareTap',
    properties: {
      ...commonProps,
      amount_usd: null,
      is_any_amount: true,
    },
  },
]

describe('PayRequestQrShareTap', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayRequestQrShareTap" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayRequestQrShareTap" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayRequestQrShareTap" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid types', () => {
    expect(() =>
      validate({
        event: 'PayRequestQrShareTap',
        properties: {
          ...commonProps,
          amount_usd: '100',
          is_any_amount: false,
        },
      })
    ).toThrow()
  })
})
