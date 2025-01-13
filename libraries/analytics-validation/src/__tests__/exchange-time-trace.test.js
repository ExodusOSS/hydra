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
