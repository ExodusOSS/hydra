import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'XopayVerificationCompleteView',
    properties: commonProps,
  },
]

describe('XopayVerificationCompleteView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "XopayVerificationCompleteView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "XopayVerificationCompleteView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "XopayVerificationCompleteView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
