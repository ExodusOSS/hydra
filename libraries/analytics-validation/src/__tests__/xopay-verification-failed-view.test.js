import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'XopayVerificationFailedView',
    properties: commonProps,
  },
]

describe('XopayVerificationFailedView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "XopayVerificationFailedView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "XopayVerificationFailedView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "XopayVerificationFailedView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
