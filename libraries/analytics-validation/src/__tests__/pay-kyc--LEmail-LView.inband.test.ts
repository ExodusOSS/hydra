import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayKycEmailView',
    properties: {
      ...commonProps,
      origin: 'home',
    },
  },
  {
    event: 'PayKycEmailView',
    properties: {
      ...commonProps,
      origin: 'deposit',
    },
  },
]

describe('PayKycEmailView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayKycEmailView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayKycEmailView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayKycEmailView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid origin type', () => {
    expect(() =>
      validate({
        event: 'PayKycEmailView',
        properties: {
          ...commonProps,
          origin: 123,
        },
      })
    ).toThrow()
  })
})
