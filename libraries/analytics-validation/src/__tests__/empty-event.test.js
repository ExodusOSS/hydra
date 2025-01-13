import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'GenericView',
    properties: {
      ...commonProps,
    },
  },
]

describe('GenericEvent', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "GenericEvent" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "GenericEvent" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "GenericEvent" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
