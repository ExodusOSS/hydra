import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'LedgerAccountConnect',
    properties: {
      ...commonProps,
      origin: 'onboarding',
      network: 'ethereum',
      total_amount: '20',
      total_amount_usd: '3516',
      success: true,
      number_of_collectibles: 8,
    },
  },
]

describe('LedgerAccountConnect', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "LedgerAccountConnect" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "LedgerAccountConnect" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "LedgerAccountConnect" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "LedgerAccountConnect" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, total_amount_usd: false },
        })
      ).toThrow()
    })
  })
})
