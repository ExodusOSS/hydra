import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletStakingUnstakeClaim',
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

describe('WalletStakingUnstakeClaim', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletStakingUnstakeClaim" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletStakingUnstakeClaim" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletStakingUnstakeClaim" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletStakingUnstakeClaim" property of invalid format', () => {
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
