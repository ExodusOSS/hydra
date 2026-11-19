import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'SettingsPortfolioAnimationToggle',
    properties: {
      ...commonProps,
      toggled_on: true,
    },
  },
]

describe('SettingsPortfolioAnimationToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "SettingsPortfolioAnimationToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "SettingsPortfolioAnimationToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "SettingsPortfolioAnimationToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "SettingsPortfolioAnimationToggle" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, toggled_on: 'yes' },
        })
      ).toThrow()
    })
  })
})
