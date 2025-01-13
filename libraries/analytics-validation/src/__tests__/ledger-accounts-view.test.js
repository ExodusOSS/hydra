import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'LedgerAccountsView',
    properties: {
      ...commonProps,
      origin: 'onboarding',
      network: 'ethereum',
      total_amount: '20',
      total_amount_usd: '3516',
      number_of_accounts: 4,
    },
  },
]

describe('LedgerAccountsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "LedgerAccountsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "LedgerAccountsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "LedgerAccountsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "LedgerAccountsView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, total_amount: true },
        })
      ).toThrow()
    })
  })
})
