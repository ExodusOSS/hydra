import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCardCreate',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayCardCreate', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCardCreate" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCardCreate" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCardCreate" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
