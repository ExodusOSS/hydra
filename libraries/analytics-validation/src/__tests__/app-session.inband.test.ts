import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'AppSession',
    properties: {
      ...commonProps,
      is_from_background: true,
    },
  },
]

describe('AppSession', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "AppSession" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "AppSession" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "AppSession" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "AppSession" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, isFromBackground: 3 },
        })
      ).toThrow()
    })
  })
})
