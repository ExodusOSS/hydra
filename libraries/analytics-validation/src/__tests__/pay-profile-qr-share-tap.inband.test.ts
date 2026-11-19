import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayProfileQRShareTap',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayProfileQRShareTap', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayProfileQRShareTap" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayProfileQRShareTap" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayProfileQRShareTap" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
