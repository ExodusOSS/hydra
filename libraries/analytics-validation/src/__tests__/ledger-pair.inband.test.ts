import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'LedgerPair',
    properties: {
      ...commonProps,
      success: true,
    },
  },
]

describe('LedgerPair', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "LedgerPair" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "LedgerPair" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "LedgerPair" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "LedgerPair" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, success: 3 },
        })
      ).toThrow()
    })
  })
})
