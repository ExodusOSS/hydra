import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'XopayCardDelete',
    properties: {
      ...commonProps,
      default_method: true,
    },
  },
]

describe('XopayCardDelete', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "XopayCardDelete" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "XopayCardDelete" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "XopayCardDelete" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "XopayCardDelete" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, default_method: '44' },
        })
      ).toThrow()
    })
  })
})
