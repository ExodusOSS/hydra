import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'RemoteWalletBannerTap',
    properties: {
      ...commonProps,
      banner_id: 2,
    },
  },
]

describe('RemoteWalletBannerTap', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "RemoteWalletBannerTap" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "RemoteWalletBannerTap" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "RemoteWalletBannerTap" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "RemoteWalletBannerTap" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, banner_id: '3' },
        })
      ).toThrow()
    })
  })
})
