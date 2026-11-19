import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayOnboardingScreenView',
    properties: {
      ...commonProps,
      screen_name: 'invite-code',
      screen_index: 0,
      invite_code: 123_456,
    },
  },
  {
    event: 'PayOnboardingScreenView',
    properties: {
      ...commonProps,
      screen_name: 'profile',
      screen_index: 1,
      invite_code: null,
    },
  },
]

describe('PayOnboardingScreenView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayOnboardingScreenView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayOnboardingScreenView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayOnboardingScreenView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should accept string invite_code', () => {
    const event = {
      event: 'PayOnboardingScreenView',
      properties: {
        ...commonProps,
        screen_name: 'invite-code',
        screen_index: 0,
        invite_code: 'ABC123',
      },
    }
    expect(validate(event)).toEqual(event)
  })

  it('Should reject invalid screen_index type', () => {
    expect(() =>
      validate({
        event: 'PayOnboardingScreenView',
        properties: {
          ...commonProps,
          screen_name: 'profile',
          screen_index: '1',
          invite_code: null,
        },
      })
    ).toThrow()
  })

  it('Should reject invalid invite_code type', () => {
    expect(() =>
      validate({
        event: 'PayOnboardingScreenView',
        properties: {
          ...commonProps,
          screen_name: 'profile',
          screen_index: 1,
          invite_code: true,
        },
      })
    ).toThrow()
  })
})
