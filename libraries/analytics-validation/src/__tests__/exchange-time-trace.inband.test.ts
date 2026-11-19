import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'ExchangeTimeTrace',
    properties: {
      ...commonProps,
      approve_tokens: 1000,
      insert_order: 1500.5,
    },
  },
  {
    event: 'ExchangeTimeTrace',
    properties: {
      ...commonProps,
      execute_trade: 400,
      total_exchange: 5000,
      time_to_broadcast: 4500,
      provider_name: 'direct',
      order_id: 'mock-order-id',
      stale_swap_aborted: true,
    },
  },
]

describe('ExchangeTimeTrace', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "ExchangeTimeTrace" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "ExchangeTimeTrace" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "ExchangeTimeTrace" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
