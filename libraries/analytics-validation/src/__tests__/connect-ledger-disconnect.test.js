import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'ConnectLedgerDisconnect',
    properties: {
      ...commonProps,
      origin: 'wallet',
    },
  },
]

describe('ConnectLedgerDisconnect', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "ConnectLedgerDisconnect" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "ConnectLedgerDisconnect" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "ConnectLedgerDisconnect" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "ConnectLedgerDisconnect" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, origin: 1 },
        })
      ).toThrow()
    })
  })
})
