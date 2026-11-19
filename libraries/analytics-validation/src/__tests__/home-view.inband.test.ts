import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'HomeView',
    properties: {
      ...commonProps,
      /**
       * Fill in your properties here
       */
      banner: 'hi',
      has_funds: true,
      robinhood_displayed: true,
    },
  },
]

describe('HomeView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "HomeView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "HomeView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "HomeView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "HomeView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, banner: 3 },
        })
      ).toThrow()
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, has_funds: 3 },
        })
      ).toThrow()
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, robinhood_displayed: 3 },
        })
      ).toThrow()
    })
  })
})
