import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayActivityTransactionDetailsView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayActivityTransactionDetailsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayActivityTransactionDetailsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayActivityTransactionDetailsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayActivityTransactionDetailsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
