import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayKYCCountryTaxIDView',
    properties: {
      ...commonProps,
      origin: 'home',
    },
  },
  {
    event: 'PayKYCCountryTaxIDView',
    properties: {
      ...commonProps,
      origin: 'deposit',
    },
  },
]

describe('PayKYCCountryTaxIDView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayKYCCountryTaxIDView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayKYCCountryTaxIDView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayKYCCountryTaxIDView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid origin type', () => {
    expect(() =>
      validate({
        event: 'PayKYCCountryTaxIDView',
        properties: {
          ...commonProps,
          origin: 123,
        },
      })
    ).toThrow()
  })
})
