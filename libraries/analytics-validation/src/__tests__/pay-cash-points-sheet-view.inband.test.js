import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCashPointsSheetView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayCashPointsSheetView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCashPointsSheetView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCashPointsSheetView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCashPointsSheetView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
