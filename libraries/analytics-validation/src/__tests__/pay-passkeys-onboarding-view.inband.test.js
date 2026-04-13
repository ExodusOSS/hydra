import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayPasskeysOnboardingView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayPasskeysOnboardingView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayPasskeysOnboardingView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayPasskeysOnboardingView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayPasskeysOnboardingView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
