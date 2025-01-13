import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'HomeEditFavoritesToggle',
    properties: {
      ...commonProps,
      toggled_on: true,
    },
  },
  {
    event: 'HomeEditFavoritesToggle',
    properties: {
      time: 1_682_084_347,
      ...commonProps,
      toggled_on: false,
    },
  },
]

describe('HomeEditFavoritesToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "HomeEditFavoritesToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "HomeEditFavoritesToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "HomeEditFavoritesToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "HomeEditFavoritesToggle" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, toggled_on: 123 },
        })
      ).toThrow()
    })
  })
})
