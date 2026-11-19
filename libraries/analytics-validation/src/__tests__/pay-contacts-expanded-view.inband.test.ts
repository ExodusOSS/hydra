import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayContactsExpandedView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayContactsExpandedView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayContactsExpandedView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayContactsExpandedView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayContactsExpandedView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
