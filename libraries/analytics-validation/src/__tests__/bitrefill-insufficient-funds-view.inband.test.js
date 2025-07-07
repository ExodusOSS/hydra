import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'BitrefillInsufficientFundsView',
    properties: {
      ...commonProps,
      origin: 'origin',
    },
  },
]

describe('BitrefillInsufficientFundsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "BitrefillInsufficientFundsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "BitrefillInsufficientFundsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "BitrefillInsufficientFundsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "BitrefillInsufficientFundsView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, origin: true },
        })
      ).toThrow()
    })
  })
})
