import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayRewardsWishlistSubmit',
    properties: {
      ...commonProps,
      store_selected: ['metal-card', 'ufc-tickets'],
      wishlist_selected: ['predictions'],
      entry_point: 'wallet_banner',
      intro_variant: 'new_user',
    },
  },
  {
    event: 'PayRewardsWishlistSubmit',
    properties: {
      ...commonProps,
      store_selected: [],
      wishlist_selected: [],
      entry_point: 'settings',
      intro_variant: 'existing_pay_user',
    },
  },
  {
    event: 'PayRewardsWishlistSubmit',
    properties: {
      ...commonProps,
      store_selected: ['metal-card', 'ufc-tickets'],
      wishlist_selected: ['predictions'],
      entry_point: 'profile',
      intro_variant: 'new_user',
    },
  },
]

describe('PayRewardsWishlistSubmit', () => {
  it.each(['swap_fee', 'onboarding', 'send_invitation'])(
    'accepts the Rewards v2 %s entry point',
    (entryPoint) => {
      const event = {
        ...fixtures[0]!,
        properties: { ...fixtures[0]!.properties, entry_point: entryPoint },
      }
      expect(validate(event)).toEqual(event)
    }
  )

  fixtures.forEach((event) => {
    it('The main schema validates "PayRewardsWishlistSubmit" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayRewardsWishlistSubmit" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayRewardsWishlistSubmit" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  const validProperties = fixtures[0]!.properties

  it.each([
    ['store_selected', 'metal-card'],
    ['store_selected', [1]],
    ['wishlist_selected', null],
    ['entry_point', 'deep_link'],
    ['intro_variant', 'returning'],
  ])('Should reject invalid %s value', (property, value) => {
    expect(() =>
      validate({
        event: 'PayRewardsWishlistSubmit',
        properties: { ...validProperties, [property]: value },
      })
    ).toThrow()
  })
})
