import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'XopayVerificationEditDetailsSave',
    properties: {
      ...commonProps,
      name_modified: true,
      dob_modified: true,
      address_modified: false,
      ssn_modified: true,
    },
  },
]

describe('XopayVerificationEditDetailsSave', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "XopayVerificationEditDetailsSave" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "XopayVerificationEditDetailsSave" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "XopayVerificationEditDetailsSave" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "XopayVerificationEditDetailsSave" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, name_modified: 3 },
        })
      ).toThrow()
    })
  })
})
