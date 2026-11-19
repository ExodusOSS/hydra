import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCashPointsClaim',
    properties: {
      ...commonProps,
      success: true,
      amount_usd: 25.5,
      amount_cash_points: 2550,
    },
  },
  {
    event: 'PayCashPointsClaim',
    properties: {
      ...commonProps,
      success: false,
      amount_usd: 0,
      amount_cash_points: 0,
    },
  },
]

describe('PayCashPointsClaim', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCashPointsClaim" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCashPointsClaim" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCashPointsClaim" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid success type', () => {
    expect(() =>
      validate({
        event: 'PayCashPointsClaim',
        properties: {
          ...commonProps,
          success: 'yes',
          amount_usd: 25,
          amount_cash_points: 2500,
        },
      })
    ).toThrow()
  })

  it('Should reject invalid amount_usd type', () => {
    expect(() =>
      validate({
        event: 'PayCashPointsClaim',
        properties: {
          ...commonProps,
          success: true,
          amount_usd: '25',
          amount_cash_points: 2500,
        },
      })
    ).toThrow()
  })

  it('Should reject invalid amount_cash_points type', () => {
    expect(() =>
      validate({
        event: 'PayCashPointsClaim',
        properties: {
          ...commonProps,
          success: true,
          amount_usd: 25,
          amount_cash_points: '2500',
        },
      })
    ).toThrow()
  })
})
