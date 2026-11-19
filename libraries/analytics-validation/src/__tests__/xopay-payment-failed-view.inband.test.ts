import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'XopayPaymentFailedView',
    properties: {
      ...commonProps,
      select_another_payment_option: false,
    },
  },
]

describe('XopayPaymentFailedView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "XopayPaymentFailedView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "XopayPaymentFailedView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "XopayPaymentFailedView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "XopayPaymentFailedView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, select_another_payment_option: 3 },
        })
      ).toThrow()
    })
  })
})
