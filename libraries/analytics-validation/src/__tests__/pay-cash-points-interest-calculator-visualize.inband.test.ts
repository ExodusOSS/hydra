import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCashPointsInterestCalculatorVisualize',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayCashPointsInterestCalculatorVisualize', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCashPointsInterestCalculatorVisualize" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCashPointsInterestCalculatorVisualize" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCashPointsInterestCalculatorVisualize" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
