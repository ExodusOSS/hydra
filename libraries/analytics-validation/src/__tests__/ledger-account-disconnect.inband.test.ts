import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'LedgerAccountDisconnect',
    properties: {
      ...commonProps,
      network: 'ethereum',
      total_amount: '20',
      amount_usd: '3516',
    },
  },
]

describe('LedgerAccountDisconnect', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "LedgerAccountDisconnect" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "LedgerAccountDisconnect" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "LedgerAccountDisconnect" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "LedgerAccountDisconnect" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, network: 3 },
        })
      ).toThrow()
    })
  })
})
