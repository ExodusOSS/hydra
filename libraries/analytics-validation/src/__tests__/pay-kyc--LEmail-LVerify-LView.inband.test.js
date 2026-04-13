import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayKYCEmailVerifyView',
    properties: {
      ...commonProps,
      origin: 'home',
    },
  },
  {
    event: 'PayKYCEmailVerifyView',
    properties: {
      ...commonProps,
      origin: 'deposit',
    },
  },
]

describe('PayKYCEmailVerifyView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayKYCEmailVerifyView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayKYCEmailVerifyView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayKYCEmailVerifyView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid origin type', () => {
    expect(() =>
      validate({
        event: 'PayKYCEmailVerifyView',
        properties: {
          ...commonProps,
          origin: 123,
        },
      })
    ).toThrow()
  })
})
