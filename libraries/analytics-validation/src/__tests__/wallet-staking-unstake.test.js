import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletStakingUnstake',
    properties: {
      ...commonProps,
      success: true,
      amount: 200,
      amount_usd: 4000,
      asset_name: 'bitcoin',
      network: 'bitcoin',
    },
  },
]

describe('WalletStakingUnstake', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletStakingUnstake" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletStakingUnstake" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletStakingUnstake" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletStakingUnstake" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, success: 'test' },
        })
      ).toThrow()
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, amount: '3' },
        })
      ).toThrow()
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, amount_usd: '3' },
        })
      ).toThrow()
    })
  })
})
