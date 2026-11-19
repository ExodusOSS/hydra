import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCardSendToVerificationView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayCardSendToVerificationView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCardSendToVerificationView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCardSendToVerificationView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCardSendToVerificationView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
