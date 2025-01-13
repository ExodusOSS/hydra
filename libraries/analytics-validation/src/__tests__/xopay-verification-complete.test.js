import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'XopayVerificationComplete',
    properties: commonProps,
  },
]

describe('XopayVerificationComplete', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "XopayVerificationComplete" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "XopayVerificationComplete" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "XopayVerificationComplete" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
