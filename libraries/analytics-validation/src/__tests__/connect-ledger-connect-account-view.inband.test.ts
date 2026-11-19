import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'ConnectLedgerConnectAccountView',
    properties: {
      ...commonProps,
      origin: 'onboarding',
      network: 'bitcoin',
    },
  },
]

describe('ConnectLedgerConnectAccountView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "ConnectLedgerConnectAccountView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "ConnectLedgerConnectAccountView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "ConnectLedgerConnectAccountView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "ConnectLedgerConnectAccountView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, network: 123 },
        })
      ).toThrow()
    })
  })
})
