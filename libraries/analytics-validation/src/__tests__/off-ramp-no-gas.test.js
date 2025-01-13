import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'OffRampNoGas',
    properties: {
      ...commonProps,
      is_zero_balance: true,
      coin_or_token: 'coin',
      asset_name: 'bitcoin',
      network: 'bitcoin',
    },
  },
]

describe('OffRampNoGas', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "OffRampNoGas" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "OffRampNoGas" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "OffRampNoGas" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "OffRampNoGas" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, is_zero_balance: 3 },
        })
      ).toThrow()
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, coin_or_token: true },
        })
      ).toThrow()
    })
  })
})
