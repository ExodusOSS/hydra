import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCashPointsInterestCalculatorDepositTap',
    properties: {
      ...commonProps,
      amount_usd: 500,
    },
  },
  {
    event: 'PayCashPointsInterestCalculatorDepositTap',
    properties: {
      ...commonProps,
      amount_usd: 1000.75,
    },
  },
]

describe('PayCashPointsInterestCalculatorDepositTap', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCashPointsInterestCalculatorDepositTap" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCashPointsInterestCalculatorDepositTap" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCashPointsInterestCalculatorDepositTap" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid amount_usd type', () => {
    expect(() =>
      validate({
        event: 'PayCashPointsInterestCalculatorDepositTap',
        properties: {
          ...commonProps,
          amount_usd: '500',
        },
      })
    ).toThrow()
  })
})
