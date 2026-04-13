import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCardExpandedView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayCardExpandedView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCardExpandedView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCardExpandedView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCardExpandedView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
