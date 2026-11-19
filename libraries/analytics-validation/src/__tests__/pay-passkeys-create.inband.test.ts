import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayPasskeysCreate',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayPasskeysCreate', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayPasskeysCreate" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayPasskeysCreate" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayPasskeysCreate" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
