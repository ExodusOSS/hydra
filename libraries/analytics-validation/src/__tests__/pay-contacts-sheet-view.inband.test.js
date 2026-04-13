import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayContactsSheetView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayContactsSheetView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayContactsSheetView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayContactsSheetView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayContactsSheetView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
