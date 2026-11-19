import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCashPointsHistoryView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayCashPointsHistoryView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCashPointsHistoryView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCashPointsHistoryView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCashPointsHistoryView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
