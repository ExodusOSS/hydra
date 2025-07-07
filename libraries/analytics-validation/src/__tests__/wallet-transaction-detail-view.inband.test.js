import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletTransactionDetailView',
    properties: {
      ...commonProps,
      asset_name: 'bitcoin',
      network: 'bitcoin',
    },
  },
]

describe('WalletTransactionDetailView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletTransactionDetailView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletTransactionDetailView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletTransactionDetailView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletTransactionDetailView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, asset_name: 3 },
        })
      ).toThrow()
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, network: 2 },
        })
      ).toThrow()
    })
  })
})
