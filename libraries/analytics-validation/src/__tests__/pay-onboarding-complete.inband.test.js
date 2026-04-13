import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayOnboardingComplete',
    properties: {
      ...commonProps,
      invite_code: 123_456,
    },
  },
  {
    event: 'PayOnboardingComplete',
    properties: {
      ...commonProps,
      invite_code: null,
    },
  },
]

describe('PayOnboardingComplete', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayOnboardingComplete" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayOnboardingComplete" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayOnboardingComplete" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid invite_code type', () => {
    expect(() =>
      validate({
        event: 'PayOnboardingComplete',
        properties: {
          ...commonProps,
          invite_code: 'abc123',
        },
      })
    ).toThrow()
  })
})
