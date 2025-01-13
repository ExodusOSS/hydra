import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'BitrefillView',
    properties: {
      time: 1_682_084_347,
      ...commonProps,
      origin: 'origin',
    },
  },
]

describe('BitrefillView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "BitrefillView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "BitrefillView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "BitrefillView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "BitrefillView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, origin: true },
        })
      ).toThrow()
    })
  })
})
