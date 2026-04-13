import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCardTransactionDetailsView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayCardTransactionDetailsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCardTransactionDetailsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCardTransactionDetailsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCardTransactionDetailsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
