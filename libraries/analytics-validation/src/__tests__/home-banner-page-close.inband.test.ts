import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'HomeBannerPageClose',
    properties: {
      ...commonProps,
      page_order: 3,
      page: 'Dashboard',
    },
  },
]

describe('HomeBannerPageClose', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "HomeBannerPageClose" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "HomeBannerPageClose" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "HomeBannerPageClose" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "HomeBannerPageClose" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, page_order: '3' },
        })
      ).toThrow()
    })
  })
})
