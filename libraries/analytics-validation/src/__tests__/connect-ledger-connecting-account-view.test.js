import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'ConnectLedgerConnectingAccountView',
    properties: {
      ...commonProps,
      network: 'solana',
      origin: 'wallet',
    },
  },
]

describe('ConnectLedgerConnectingAccountView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "ConnectLedgerConnectingAccountView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "ConnectLedgerConnectingAccountView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "ConnectLedgerConnectingAccountView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "ConnectLedgerConnectingAccountView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, origin: 1, network: 2 },
        })
      ).toThrow()
    })
  })
})
