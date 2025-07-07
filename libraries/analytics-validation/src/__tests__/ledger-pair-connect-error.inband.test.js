import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'LedgerPairConnectError',
    properties: {
      ...commonProps,
      error_type: 'ledger-bluetooth',
    },
  },
]

describe('LedgerPairConnectError', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "LedgerPairConnectError" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "LedgerPairConnectError" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "LedgerPairConnectError" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "LedgerPairConnectError" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, error_type: 3 },
        })
      ).toThrow()
    })
  })
})
