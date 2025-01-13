import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'OnboardingNewWalletTap',
    properties: {
      ...commonProps,
      has_invite_code: false,
      invite_code: 'ABCDEF',
    },
  },
]

describe('OnboardingNewWalletTap', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "OnboardingNewWalletTap" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "OnboardingNewWalletTap" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "OnboardingNewWalletTap" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "OnboardingNewWalletTap" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, has_invite_code: 'NO' },
        })
      ).toThrow()
    })
  })
})
