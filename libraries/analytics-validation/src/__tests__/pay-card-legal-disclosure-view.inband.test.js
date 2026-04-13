import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCardLegalDisclosureView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayCardLegalDisclosureView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCardLegalDisclosureView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCardLegalDisclosureView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCardLegalDisclosureView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
