import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayRewardsBannerDismiss',
    properties: {
      ...commonProps,
      invitation: 'new',
    },
  },
  {
    event: 'PayRewardsBannerDismiss',
    properties: {
      ...commonProps,
      invitation: 'existing',
    },
  },
]

describe('PayRewardsBannerDismiss', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayRewardsBannerDismiss" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayRewardsBannerDismiss" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayRewardsBannerDismiss" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid invitation value', () => {
    expect(() =>
      validate({
        event: 'PayRewardsBannerDismiss',
        properties: { ...commonProps, invitation: 'returning' },
      })
    ).toThrow()
  })

  it('Should reject invalid invitation type', () => {
    expect(() =>
      validate({
        event: 'PayRewardsBannerDismiss',
        properties: { ...commonProps, invitation: 1 },
      })
    ).toThrow()
  })
})
