import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'XopayVerificationEmailInputView',
    properties: commonProps,
  },
]

describe('XopayVerificationEmailInputView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "XopayVerificationEmailInputView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "XopayVerificationEmailInputView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "XopayVerificationEmailInputView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
