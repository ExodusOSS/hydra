import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetManagerToggle',
    properties: {
      ...commonProps,
      toggled_on: true,
      asset_name: 'bitcoin',
      network: 'bitcoin',
    },
  },
]

describe('WalletAssetManagerToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetManagerToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetManagerToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetManagerToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetManagerToggle" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, toggled_on: 3 },
        })
      ).toThrow()
    })
  })
})
