import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'OnboardingConnectLedgerConnectionErrorView',
    properties: {
      ...commonProps,
      error_type: 'error',
    },
  },
]

describe('OnboardingConnectLedgerConnectionErrorView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "OnboardingConnectLedgerConnectionErrorView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "OnboardingConnectLedgerConnectionErrorView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "OnboardingConnectLedgerConnectionErrorView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "OnboardingConnectLedgerConnectionErrorView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, error_type: 123 },
        })
      ).toThrow()
    })
  })
})
