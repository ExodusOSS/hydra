import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayProfileSettingsBackgroundAnimationToggle',
    properties: {
      ...commonProps,
      toggle_on: true,
    },
  },
  {
    event: 'PayProfileSettingsBackgroundAnimationToggle',
    properties: {
      ...commonProps,
      toggle_on: false,
    },
  },
]

describe('PayProfileSettingsBackgroundAnimationToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayProfileSettingsBackgroundAnimationToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayProfileSettingsBackgroundAnimationToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayProfileSettingsBackgroundAnimationToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid toggle_on type', () => {
    expect(() =>
      validate({
        event: 'PayProfileSettingsBackgroundAnimationToggle',
        properties: {
          ...commonProps,
          toggle_on: 'yes',
        },
      })
    ).toThrow()
  })
})
