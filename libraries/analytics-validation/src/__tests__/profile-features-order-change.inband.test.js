import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'ProfileFeaturesOrderChange',
    properties: {
      ...commonProps,
      order_from: 1,
      order_to: 2,
      feature_name: 'Refferals',
    },
  },
]

describe('ProfileFeaturesOrderChange', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "ProfileFeaturesOrderChange" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "ProfileFeaturesOrderChange" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "ProfileFeaturesOrderChange" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "ProfileFeaturesOrderChange" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, orderFrom: 'lala' },
        })
      ).toThrow()
    })
  })
})
