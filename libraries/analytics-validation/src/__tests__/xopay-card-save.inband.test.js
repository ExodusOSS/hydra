import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'XopayCardSave',
    properties: {
      ...commonProps,
      default_method: false,
    },
  },
]

describe('XopayCardSave', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "XopayCardSave" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "XopayCardSave" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "XopayCardSave" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "XopayCardSave" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, default_method: 3 },
        })
      ).toThrow()
    })
  })
})
