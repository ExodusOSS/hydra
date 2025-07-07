import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletSaleDetailView',
    properties: {
      ...commonProps,
      origin: 'home',
    },
  },
  {
    event: 'WalletSaleDetailView',
    properties: {
      ...commonProps,
      origin: 'recent-activity',
    },
  },
]

describe('WalletSaleDetailView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletSaleDetailView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletSaleDetailView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletSaleDetailView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletSaleDetailView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, origin: 123 },
        })
      ).toThrow()
    })
  })
})
