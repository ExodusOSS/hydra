import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayRequestView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayRequestView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayRequestView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayRequestView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayRequestView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
