import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayPayView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayPayView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayPayView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayPayView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayPayView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
