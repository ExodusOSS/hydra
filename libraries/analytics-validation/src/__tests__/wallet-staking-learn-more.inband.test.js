import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletStakingEthLearnMoreView',
    properties: {
      ...commonProps,
      asset_name: 'ethereum',
      network: 'ethereum',
    },
  },
]

describe('WalletStakingEthLearnMore', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletStakingEthLearnMore" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletStakingEthLearnMore" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletStakingEthLearnMore" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletStakingEthLearnMore" property of invalid format', () => {
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
