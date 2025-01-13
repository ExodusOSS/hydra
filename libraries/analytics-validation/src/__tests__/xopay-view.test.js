import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'XopayView',
    properties: {
      ...commonProps,
      verification_failed_warning: true,
      verification_details_check_warning: false,
      verification_processing_warning: true,
    },
  },
]

describe('XopayView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "XopayView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "XopayView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "XopayView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "XopayView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, verification_failed_warning: 3 },
        })
      ).toThrow()
    })
  })
})
