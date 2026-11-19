import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetTRXActivateTap',
    properties: {
      ...commonProps,
    },
  },
]

describe('WalletAssetTRXActivateTap', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetTRXActivateTap" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetTRXActivateTap" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetTRXActivateTap" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
