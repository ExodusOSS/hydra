import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetFavoriteToggle',
    properties: {
      ...commonProps,
      asset_name: 'bitcoin',
      network: 'bitcoin',
      toggled_on: false,
    },
  },
]

describe('WalletAssetFavoriteToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetFavoriteToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetFavoriteToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetFavoriteToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetFavoriteToggle" properties of invalid format', () => {
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
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, toggled_on: 'true' },
        })
      ).toThrow()
    })
  })
})
