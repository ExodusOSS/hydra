import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'Web3BrowserHardwareWalletView',
    properties: {
      ...commonProps,
      asset_name: 'bitcoin',
      network: 'bitcoin',
    },
  },
]

describe('Web3BrowserHardwareWalletView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "Web3BrowserHardwareWalletView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "Web3BrowserHardwareWalletView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "Web3BrowserHardwareWalletView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "Web3BrowserHardwareWalletView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, asset_name: 1, network: 2 },
        })
      ).toThrow()
    })
  })
})
