import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'XopayVerificationMobileChallengeView',
    properties: {
      ...commonProps,
      challenge_method: 'magiclink',
    },
  },
]

describe('XopayVerificationMobileChallengeView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "XopayVerificationMobileChallengeView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "XopayVerificationMobileChallengeView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "XopayVerificationMobileChallengeView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "XopayVerificationMobileChallengeView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, challenge_method: 5 },
        })
      ).toThrow()
    })
  })
})
