import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'OnboardingPageView',
    properties: {
      ...commonProps,
      page: "The only Web3 wallet\nyou'll ever need",
      page_order: 1,
    },
  },
]

describe('OnboardingPageView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "OnboardingPageView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "OnboardingPageView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "OnboardingPageView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "OnboardingPageView" property of invalid format', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, page_order: 'cat' } })
      ).toThrow()
    })
  })
})
