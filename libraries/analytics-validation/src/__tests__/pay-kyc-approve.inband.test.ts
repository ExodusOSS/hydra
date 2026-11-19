import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayKYCApprove',
    properties: {
      ...commonProps,
      origin: 'home',
      tax_country: 'United States',
      needed_more_details: false,
      feature: 'base',
    },
  },
  {
    event: 'PayKYCApprove',
    properties: {
      ...commonProps,
      origin: 'pay',
      tax_country: 'Canada',
      needed_more_details: true,
      feature: 'card',
    },
  },
]

describe('PayKYCApprove', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayKYCApprove" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayKYCApprove" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayKYCApprove" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid types', () => {
    expect(() =>
      validate({
        event: 'PayKYCApprove',
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
        event: 'PayKYCApprove',
        properties: {
          ...commonProps,
          origin: 'home',
          tax_country: 'United States',
          needed_more_details: 'yes',
        },
      })
    ).toThrow()
  })
})
