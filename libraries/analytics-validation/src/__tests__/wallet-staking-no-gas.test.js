import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletStakingNoGas',
    properties: {
      ...commonProps,
      is_zero_balance: true,
      asset_name: 'bitcoin',
      network: 'bitcoin',
    },
  },
]

describe('WalletStakingNoGas', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletStakingNoGas" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletStakingNoGas" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletStakingNoGas" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "WalletStakingNoGas" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, is_zero_balance: 3 },
        })
      ).toThrow()
    })
  })
})
