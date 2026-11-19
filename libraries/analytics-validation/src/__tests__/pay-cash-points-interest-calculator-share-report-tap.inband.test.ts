import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCashPointsInterestCalculatorShareReportTap',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayCashPointsInterestCalculatorShareReportTap', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCashPointsInterestCalculatorShareReportTap" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCashPointsInterestCalculatorShareReportTap" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCashPointsInterestCalculatorShareReportTap" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
