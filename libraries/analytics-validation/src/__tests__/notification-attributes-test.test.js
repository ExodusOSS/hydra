import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'NotificationAttributesTest',
    properties: {
      ...commonProps,
      is_referrer: false,
      viewed_web3_browser_last_90: false,
      wallet_created_at: '2023-08-18',
      has_backup: true,
      country: 'US',
      region: 'NY',
      platform: 'ios',
      environment: 'GCM',
      price_change_threshold: '10',
      topics: ['wallet_activity', 'price_change', 'product_updates', 'offers'],
      enabled_assets: ['bitcoin', 'bitcoinregtest', 'ethereum'],
    },
  },
]

describe('NotificationAttributesTest', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "NotificationAttributesTest" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "NotificationAttributesTest" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "NotificationAttributesTest" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "NotificationAttributesTest" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, country: 'secret' },
        })
      ).toThrow()

      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, region: 'secretphrase' },
        })
      ).toThrow()

      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, can_backup: 'secret' },
        })
      ).toThrow()

      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, platform: 'secret 12 words' },
        })
      ).toThrow()

      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, environment: 'these are secret 12 words' },
        })
      ).toThrow()

      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, topics: 'secret' },
        })
      ).toThrow()

      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, topics: ['these are secret 12 words'] },
        })
      ).toThrow()

      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, enabled_assets: 'secret' },
        })
      ).toThrow()

      expect(() =>
        validate({
          event: event.event,
          properties: {
            ...event.properties,
            enabled_assets: ['these are the secret 12 words I chose'],
          },
        })
      ).toThrow()

      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, price_change_threshold: 'secret' },
        })
      ).toThrow()
    })
  })
})
