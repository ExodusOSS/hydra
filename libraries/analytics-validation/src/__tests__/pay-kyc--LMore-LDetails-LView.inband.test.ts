import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayKycMoreDetailsView',
    properties: {
      ...commonProps,
      origin: 'home',
      tax_country: 'United States',
    },
  },
  {
    event: 'PayKycMoreDetailsView',
    properties: {
      ...commonProps,
      origin: 'deposit',
      tax_country: 'Canada',
    },
  },
]

describe('PayKycMoreDetailsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayKycMoreDetailsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayKycMoreDetailsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayKycMoreDetailsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid origin type', () => {
    expect(() =>
      validate({
        event: 'PayKycMoreDetailsView',
        properties: {
          ...commonProps,
          origin: 123,
          tax_country: 'United States',
        },
      })
    ).toThrow()
  })

  it('Should reject invalid tax_country type', () => {
    expect(() =>
      validate({
        event: 'PayKycMoreDetailsView',
        properties: {
          ...commonProps,
          origin: 'home',
          tax_country: 123,
        },
      })
    ).toThrow()
  })
})
