import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayContactsEdit',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayContactsEdit', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayContactsEdit" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayContactsEdit" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayContactsEdit" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
