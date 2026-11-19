import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCardSheetView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayCardSheetView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCardSheetView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCardSheetView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCardSheetView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
