import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletStakingEthTermsView',
    properties: {
      ...commonProps,
      asset_name: 'ethereum',
      network: 'ethereum',
    },
  },
]

describe('WalletStakingEthTermsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletStakingEthTermsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletStakingEthTermsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletStakingEthTermsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletStakingEthTermsView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, network: 123 },
        })
      ).toThrow()
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, asset_name: 3 },
        })
      ).toThrow()
    })
  })
})
