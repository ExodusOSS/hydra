import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletStakingRestake',
    properties: {
      ...commonProps,
      success: true,
      toggled_on: true,
      is_expiration: false,
      is_staking: true,
      staked_amount: '0.01',
      staked_amount_usd: '0.08993441',
      claimable_rewards_amount: '0.000038',
      claimable_rewards_amount_usd: '0.00034175',
      asset_name: 'cosmos',
      network: 'cosmos',
    },
  },
]

describe('WalletStakingRestake', () => {
  fixtures.forEach((event) => {
    it('The main schema validates WalletStakingRestake event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of WalletStakingRestake event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in properties of WalletStakingRestake event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject WalletStakingRestake property of invalid format', () => {
      const booleanProps = ['success', 'toggle_on', 'is_expiration', 'is_staking']
      const stringProps = [
        'staked_amount',
        'staked_amount_usd',
        'claimable_rewards_amount',
        'claimable_rewards_amount_usd',
        'asset_name',
        'network',
      ]

      // should throw validation error when boolean props receive invalid value
      const testProp = (prop, invalidVal) =>
        expect(() =>
          validate({
            event: event.event,
            properties: { ...event.properties, [prop]: invalidVal },
          }).toThrow()
        )

      // should throw, when receives string instead of boolean
      booleanProps.forEach((prop) => testProp(prop, 'invalid'))

      // should throw, when receives number instead of boolean
      booleanProps.forEach((prop) => testProp(prop, 3))

      // should throw, when receives boolean instead of string
      stringProps.forEach((prop) => testProp(prop, false))

      // should throw, when receives number instead of string
      stringProps.forEach((prop) => testProp(prop, 3))
    })
  })
})
