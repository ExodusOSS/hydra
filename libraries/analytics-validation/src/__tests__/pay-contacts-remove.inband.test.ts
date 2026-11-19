import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayContactsRemove',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayContactsRemove', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayContactsRemove" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayContactsRemove" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayContactsRemove" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
