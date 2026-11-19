import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayKycCountryTaxIDView',
    properties: {
      ...commonProps,
      origin: 'home',
    },
  },
  {
    event: 'PayKycCountryTaxIDView',
    properties: {
      ...commonProps,
      origin: 'deposit',
    },
  },
]

describe('PayKycCountryTaxIDView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayKycCountryTaxIDView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayKycCountryTaxIDView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayKycCountryTaxIDView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid origin type', () => {
    expect(() =>
      validate({
        event: 'PayKycCountryTaxIDView',
        properties: {
          ...commonProps,
          origin: 123,
        },
      })
    ).toThrow()
  })
})
