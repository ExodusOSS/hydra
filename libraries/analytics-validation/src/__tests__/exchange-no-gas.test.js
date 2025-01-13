import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'ExchangeNoGas',
    properties: {
      ...commonProps,
      /**
       * Fill in your properties here
       */
      is_zero_balance: true,
      coin_or_token: 'coin',
      is_all: true,
      user_amount_from_usd: 0,
      asset_name: 'bitcoin',
      network: 'bitcoin',
    },
  },
]

describe('ExchangeNoGas', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "ExchangeNoGas" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "ExchangeNoGas" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "ExchangeNoGas" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "ExchangeNoGas" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, user_amount_from_usd: '3' },
        })
      ).toThrow()
    })
  })
})
