import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'OnboardingConnectLedgerConnectAccountView',
    properties: {
      ...commonProps,
      origin: 'onboarding',
      network: 'bitcoin',
    },
  },
]

describe('OnboardingConnectLedgerConnectAccountView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "OnboardingConnectLedgerConnectAccountView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "OnboardingConnectLedgerConnectAccountView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "OnboardingConnectLedgerConnectAccountView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "OnboardingConnectLedgerConnectAccountView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, network: 123 },
        })
      ).toThrow()
    })
  })
})
