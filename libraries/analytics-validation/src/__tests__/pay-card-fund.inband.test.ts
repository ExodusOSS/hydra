import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCardFund',
    properties: {
      ...commonProps,
      success: true,
      amount_usd: 100.5,
    },
  },
  {
    event: 'PayCardFund',
    properties: {
      ...commonProps,
      success: false,
      amount_usd: 250,
    },
  },
]

describe('PayCardFund', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCardFund" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCardFund" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCardFund" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid success type', () => {
    expect(() =>
      validate({
        event: 'PayCardFund',
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
        event: 'PayCardFund',
        properties: {
          ...commonProps,
          success: true,
          amount_usd: '100',
        },
      })
    ).toThrow()
  })
})
