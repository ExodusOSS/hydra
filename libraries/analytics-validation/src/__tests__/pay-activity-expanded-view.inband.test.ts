import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayActivityExpandedView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayActivityExpandedView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayActivityExpandedView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayActivityExpandedView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayActivityExpandedView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
