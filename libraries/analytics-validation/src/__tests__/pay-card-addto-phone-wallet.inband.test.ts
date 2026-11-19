import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCardAddtoPhoneWallet',
    properties: {
      ...commonProps,
      success: true,
    },
  },
  {
    event: 'PayCardAddtoPhoneWallet',
    properties: {
      ...commonProps,
      success: false,
    },
  },
]

describe('PayCardAddtoPhoneWallet', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCardAddtoPhoneWallet" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCardAddtoPhoneWallet" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCardAddtoPhoneWallet" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid success type', () => {
    expect(() =>
      validate({
        event: 'PayCardAddtoPhoneWallet',
        properties: {
          ...commonProps,
          success: 'yes',
        },
      })
    ).toThrow()
  })
})
