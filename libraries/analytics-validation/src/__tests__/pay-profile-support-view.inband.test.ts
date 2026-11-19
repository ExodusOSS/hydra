import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayProfileSupportView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayProfileSupportView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayProfileSupportView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayProfileSupportView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayProfileSupportView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
