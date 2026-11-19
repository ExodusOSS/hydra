import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCardTransferFunds',
    properties: {
      ...commonProps,
      success: true,
      amount_usd: 50.75,
    },
  },
  {
    event: 'PayCardTransferFunds',
    properties: {
      ...commonProps,
      success: false,
      amount_usd: 1000,
    },
  },
]

describe('PayCardTransferFunds', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCardTransferFunds" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCardTransferFunds" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCardTransferFunds" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid success type', () => {
    expect(() =>
      validate({
        event: 'PayCardTransferFunds',
        properties: {
          ...commonProps,
          success: 'yes',
          amount_usd: 100,
        },
      })
    ).toThrow()
  })

  it('Should reject invalid amount_usd type', () => {
    expect(() =>
      validate({
        event: 'PayCardTransferFunds',
        properties: {
          ...commonProps,
          success: true,
          amount_usd: '100',
        },
      })
    ).toThrow()
  })
})
