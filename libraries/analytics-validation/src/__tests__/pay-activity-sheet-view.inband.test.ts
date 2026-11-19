import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayActivitySheetView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayActivitySheetView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayActivitySheetView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayActivitySheetView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayActivitySheetView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
