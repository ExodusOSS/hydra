import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'XopayVerificationDetailsConfirmationView',
    properties: {
      ...commonProps,
      challenge_method: 'instantlink',
    },
  },
]

describe('XopayVerificationDetailsConfirmationView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "XopayVerificationDetailsConfirmationView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "XopayVerificationDetailsConfirmationView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "XopayVerificationDetailsConfirmationView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "XopayVerificationDetailsConfirmationView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, challenge_method: 6 },
        })
      ).toThrow()
    })
  })
})
