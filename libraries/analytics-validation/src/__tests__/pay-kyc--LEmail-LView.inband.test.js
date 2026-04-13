import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayKYCEmailView',
    properties: {
      ...commonProps,
      origin: 'home',
    },
  },
  {
    event: 'PayKYCEmailView',
    properties: {
      ...commonProps,
      origin: 'deposit',
    },
  },
]

describe('PayKYCEmailView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayKYCEmailView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayKYCEmailView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayKYCEmailView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid origin type', () => {
    expect(() =>
      validate({
        event: 'PayKYCEmailView',
        properties: {
          ...commonProps,
          origin: 123,
        },
      })
    ).toThrow()
  })
})
