import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetFreezingView',
    properties: {
      ...commonProps,
      for_what: 'energy',
    },
  },
]

describe('WalletAssetFreezingView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetFreezingView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetFreezingView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetFreezingView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletAssetFreezingView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, for_what: 3 },
        })
      ).toThrow()
    })
  })
})
