import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCardTransferFundsView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayCardTransferFundsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCardTransferFundsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCardTransferFundsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCardTransferFundsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
