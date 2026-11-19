import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'OnboardingExistingWalletTap',
    properties: {
      ...commonProps,
      invite_code: 'ABCDEF',
    },
  },
]

describe('OnboardingExistingWalletTap', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "OnboardingExistingWalletTap" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "OnboardingExistingWalletTap" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "OnboardingExistingWalletTap" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "OnboardingExistingWalletTap" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, invite_code: 3 },
        })
      ).toThrow()
    })
  })
})
