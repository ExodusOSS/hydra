import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCashPointsInterestCalculatorView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayCashPointsInterestCalculatorView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCashPointsInterestCalculatorView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCashPointsInterestCalculatorView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCashPointsInterestCalculatorView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
