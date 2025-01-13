import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'XopayVerificationStartView',
    properties: commonProps,
  },
]

describe('XopayVerificationStartView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "XopayVerificationStartView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "XopayVerificationStartView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "XopayVerificationStartView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
