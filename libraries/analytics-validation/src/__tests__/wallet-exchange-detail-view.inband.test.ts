import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletExchangeDetailView',
    properties: {
      ...commonProps,
      asset_name_from: 'bitcoin',
      network_from: 'bitcoin',
      asset_name_to: 'ethereum',
      network_to: 'ethereum',
    },
  },
]

describe('WalletExchangeDetailView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletExchangeDetailView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletExchangeDetailView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletExchangeDetailView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletExchangeDetailView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, asset_name_from: 3 },
        })
      ).toThrow()
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, network_from: 2 },
        })
      ).toThrow()
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, asset_name_to: 3 },
        })
      ).toThrow()
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, network_to: 2 },
        })
      ).toThrow()
    })
  })
})
