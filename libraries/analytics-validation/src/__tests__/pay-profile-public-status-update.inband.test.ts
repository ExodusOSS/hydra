import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayProfilePublicStatusUpdate',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayProfilePublicStatusUpdate', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayProfilePublicStatusUpdate" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayProfilePublicStatusUpdate" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayProfilePublicStatusUpdate" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
