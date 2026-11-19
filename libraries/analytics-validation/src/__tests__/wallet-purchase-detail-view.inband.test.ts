import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletPurchaseDetailView',
    properties: {
      ...commonProps,
      origin: 'home',
    },
  },
  {
    event: 'WalletPurchaseDetailView',
    properties: {
      ...commonProps,
      origin: 'recent-activity',
    },
  },
]

describe('WalletPurchaseDetailView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletPurchaseDetailView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletPurchaseDetailView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletPurchaseDetailView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletPurchaseDetailView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, origin: 123 },
        })
      ).toThrow()
    })
  })
})
