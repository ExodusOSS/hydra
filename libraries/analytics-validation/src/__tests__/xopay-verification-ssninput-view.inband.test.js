import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'XopayVerificationSsninputView',
    properties: commonProps,
  },
]

describe('XopayVerificationSsninputView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "XopayVerificationSsninputView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "XopayVerificationSsninputView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "XopayVerificationSsninputView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
