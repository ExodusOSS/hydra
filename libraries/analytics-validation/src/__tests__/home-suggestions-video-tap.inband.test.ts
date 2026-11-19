import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'HomeSuggestionsVideoTap',
    properties: {
      ...commonProps,
      /**
       * Fill in your properties here
       */
      position: 2,
      link: 'https://www.youtube.com/',
    },
  },
]

describe('HomeSuggestionsVideoTap', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "HomeSuggestionsVideoTap" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "HomeSuggestionsVideoTap" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "HomeSuggestionsVideoTap" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "HomeSuggestionsVideoTap" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, position: 'string' },
        })
      ).toThrow()

      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, link: 1 },
        })
      ).toThrow()
    })
  })
})
