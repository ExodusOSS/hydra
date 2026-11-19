import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'RemoteWalletBannerView',
    properties: {
      banner_id: 1,
      ...commonProps,
    },
  },
]

describe('RemoteWalletBannerView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "RemoteWalletBannerView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "RemoteWalletBannerView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "RemoteWalletBannerView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "RemoteWalletBannerView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, banner_id: '2' },
        })
      ).toThrow()
    })
  })
})
