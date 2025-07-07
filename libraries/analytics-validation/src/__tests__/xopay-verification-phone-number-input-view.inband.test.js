import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'XopayVerificationPhoneNumberInputView',
    properties: commonProps,
  },
]

describe('XopayVerificationPhoneNumberInputView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "XopayVerificationPhoneNumberInputView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "XopayVerificationPhoneNumberInputView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "XopayVerificationPhoneNumberInputView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
