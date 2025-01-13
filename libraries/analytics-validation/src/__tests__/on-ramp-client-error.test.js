import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'OnRampClientError',
    properties: {
      ...commonProps,
      error_type: 'assets',
    },
  },
]

describe('OnRampClientError', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "OnRampClientError" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "OnRampClientError" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "OnRampClientError" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "OnRampClientError" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, error_type: 3 },
        })
      ).toThrow()
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, error_type: 'invalid' },
        })
      ).toThrow()
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, error_type: true },
        })
      ).toThrow()
    })
  })
})
