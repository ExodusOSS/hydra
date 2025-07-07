import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'XopayVerificationProcessingView',
    properties: commonProps,
  },
]

describe('XopayVerificationProcessingView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "XopayVerificationProcessingView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "XopayVerificationProcessingView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "XopayVerificationProcessingView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
