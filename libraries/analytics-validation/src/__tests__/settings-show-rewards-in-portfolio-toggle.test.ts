import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'SettingsShowRewardsInPortfolioToggle',
    properties: {
      ...commonProps,
      toggled_on: true,
    },
  },
]

describe('SettingsShowRewardsInPortfolioToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "SettingsShowRewardsInPortfolioToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "SettingsShowRewardsInPortfolioToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "SettingsShowRewardsInPortfolioToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "SettingsShowRewardsInPortfolioToggle" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, toggled_on: 'yes' },
        })
      ).toThrow()
    })
  })
})
