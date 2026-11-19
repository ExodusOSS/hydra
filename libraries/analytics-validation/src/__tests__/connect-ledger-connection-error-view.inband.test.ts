import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'ConnectLedgerConnectionErrorView',
    properties: {
      ...commonProps,
      network: 'bitcoin',
      origin: 'wallet',
    },
  },
]

describe('ConnectLedgerConnectionErrorView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "ConnectLedgerConnectionErrorView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "ConnectLedgerConnectionErrorView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "ConnectLedgerConnectionErrorView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "ConnectLedgerConnectionErrorView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, origin: 1, network: 2 },
        })
      ).toThrow()
    })
  })
})
