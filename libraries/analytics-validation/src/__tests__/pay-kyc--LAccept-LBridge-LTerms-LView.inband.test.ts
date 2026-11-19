import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayKycAcceptBridgeTermsView',
    properties: {
      ...commonProps,
      origin: 'home',
      tax_country: 'United States',
    },
  },
  {
    event: 'PayKycAcceptBridgeTermsView',
    properties: {
      ...commonProps,
      origin: 'deposit',
      tax_country: 'Canada',
    },
  },
]

describe('PayKycAcceptBridgeTermsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayKycAcceptBridgeTermsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayKycAcceptBridgeTermsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayKycAcceptBridgeTermsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid origin type', () => {
    expect(() =>
      validate({
        event: 'PayKycAcceptBridgeTermsView',
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
        event: 'PayKycAcceptBridgeTermsView',
        properties: {
          ...commonProps,
          origin: 'home',
          tax_country: 123,
        },
      })
    ).toThrow()
  })
})
