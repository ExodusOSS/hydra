import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'XopayVerificationFailedCheckDetailsView',
    properties: commonProps,
  },
]

describe('XopayVerificationFailedCheckDetailsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "XopayVerificationFailedCheckDetailsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "XopayVerificationFailedCheckDetailsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "XopayVerificationFailedCheckDetailsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
