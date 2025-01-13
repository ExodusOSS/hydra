import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'XopayVerificationInProgressView',
    properties: commonProps,
  },
]

describe('XopayVerificationInProgressView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "XopayVerificationInProgressView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "XopayVerificationInProgressView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "XopayVerificationInProgressView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
