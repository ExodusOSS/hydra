import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayKYCFail',
    properties: {
      ...commonProps,
      origin: 'home',
      tax_country: 'United States',
      needed_more_details: false,
    },
  },
  {
    event: 'PayKYCFail',
    properties: {
      ...commonProps,
      origin: 'deposit',
      tax_country: 'Mexico',
      needed_more_details: true,
    },
  },
]

describe('PayKYCFail', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayKYCFail" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayKYCFail" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayKYCFail" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid types', () => {
    expect(() =>
      validate({
        event: 'PayKYCFail',
        properties: {
          ...commonProps,
          origin: 123,
          tax_country: 'United States',
          needed_more_details: false,
        },
      })
    ).toThrow()
  })

  it('Should reject invalid needed_more_details type', () => {
    expect(() =>
      validate({
        event: 'PayKYCFail',
        properties: {
          ...commonProps,
          origin: 'home',
          tax_country: 'United States',
          needed_more_details: 'no',
        },
      })
    ).toThrow()
  })
})
