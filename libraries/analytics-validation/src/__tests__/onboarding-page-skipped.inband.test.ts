import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'OnboardingPageSkipped',
    properties: {
      ...commonProps,
      page: 'Welcome to Exodus',
    },
  },
]

describe('OnboardingPageView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "OnboardingPageSkipped" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "OnboardingPageSkipped" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "OnboardingPageSkipped" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "OnboardingPageSkipped" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, page: 'explosive diarrhea is nothing to laugh about' },
        })
      ).toThrow()
    })
  })
})
