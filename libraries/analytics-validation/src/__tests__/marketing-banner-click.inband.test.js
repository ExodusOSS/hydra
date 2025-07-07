import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'MarketingBannerClick',
    properties: {
      ...commonProps,
      banner_id: 1,
      banner_type: 'marketing',
    },
  },
]

describe('MarketingBannerClick', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "MarketingBannerClick" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "MarketingBannerClick" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "MarketingBannerClick" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "MarketingBannerClick" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, banner_id: '1' },
        })
      ).toThrow()
    })
  })
})
