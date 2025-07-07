import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'DAppSignTransactionNoGas',
    properties: {
      time: 1_682_084_347,
      ...commonProps,
      /**
       * Fill in your properties here
       */
      is_zero_balance: true,
      connection_protocol: 'WalletConnect',
      network: 'bitcoin',
    },
  },
]

describe('DAppSignTransactionNoGas', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "DAppSignTransactionNoGas" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "DAppSignTransactionNoGas" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "DAppSignTransactionNoGas" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "DAppSignTransactionNoGas" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, is_zero_balance: 3 },
        })
      ).toThrow()
    })
  })
})
