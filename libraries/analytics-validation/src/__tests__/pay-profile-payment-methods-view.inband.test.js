import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayProfilePaymentMethodsView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayProfilePaymentMethodsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayProfilePaymentMethodsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayProfilePaymentMethodsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayProfilePaymentMethodsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
