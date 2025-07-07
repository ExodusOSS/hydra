import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'XopaySettingsView',
    properties: {
      ...commonProps,
      verification_failed_warning: false,
      verification_details_check_warning: true,
      verification_processing_warning: true,
    },
  },
]

describe('XopaySettingsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "XopaySettingsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "XopaySettingsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "XopaySettingsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "XopaySettingsView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, verification_processing_warning: 3 },
        })
      ).toThrow()
    })
  })
})
