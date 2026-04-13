import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayKYCMoreDetailsView',
    properties: {
      ...commonProps,
      origin: 'home',
      tax_country: 'United States',
    },
  },
  {
    event: 'PayKYCMoreDetailsView',
    properties: {
      ...commonProps,
      origin: 'deposit',
      tax_country: 'Canada',
    },
  },
]

describe('PayKYCMoreDetailsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayKYCMoreDetailsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayKYCMoreDetailsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayKYCMoreDetailsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid origin type', () => {
    expect(() =>
      validate({
        event: 'PayKYCMoreDetailsView',
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
        event: 'PayKYCMoreDetailsView',
        properties: {
          ...commonProps,
          origin: 'home',
          tax_country: 123,
        },
      })
    ).toThrow()
  })
})
