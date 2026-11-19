import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCardDetailsView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayCardDetailsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCardDetailsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCardDetailsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCardDetailsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
