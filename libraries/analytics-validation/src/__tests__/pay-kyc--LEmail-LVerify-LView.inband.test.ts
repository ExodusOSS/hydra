import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayKycEmailVerifyView',
    properties: {
      ...commonProps,
      origin: 'home',
    },
  },
  {
    event: 'PayKycEmailVerifyView',
    properties: {
      ...commonProps,
      origin: 'deposit',
    },
  },
]

describe('PayKycEmailVerifyView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayKycEmailVerifyView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayKycEmailVerifyView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayKycEmailVerifyView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid origin type', () => {
    expect(() =>
      validate({
        event: 'PayKycEmailVerifyView',
        properties: {
          ...commonProps,
          origin: 123,
        },
      })
    ).toThrow()
  })
})
