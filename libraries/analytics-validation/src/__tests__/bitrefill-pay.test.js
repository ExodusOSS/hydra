import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'BitrefillPay',
    properties: {
      ...commonProps,
      origin: 'origin',
      success: true,
    },
  },
]

describe('BitrefillPay', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "BitrefillPay" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "BitrefillPay" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "BitrefillPay" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "BitrefillPay" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, origin: true },
        })
      ).toThrow()

      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, success: 'success' },
        })
      ).toThrow()
    })
  })
})
