import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'BitrefillPaymentView',
    properties: {
      ...commonProps,
      origin: 'origin',
    },
  },
]

describe('BitrefillPaymentView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "BitrefillPaymentView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "BitrefillPaymentView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "BitrefillPaymentView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "BitrefillPaymentView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, origin: true },
        })
      ).toThrow()
    })
  })
})
