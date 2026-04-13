import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayDepositMethodAdd',
    properties: {
      ...commonProps,
      deposit_type: 'mastercard',
    },
  },
  {
    event: 'PayDepositMethodAdd',
    properties: {
      ...commonProps,
      deposit_type: 'apple-pay',
    },
  },
]

describe('PayDepositMethodAdd', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayDepositMethodAdd" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayDepositMethodAdd" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayDepositMethodAdd" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid deposit_type type', () => {
    expect(() =>
      validate({
        event: 'PayDepositMethodAdd',
        properties: {
          ...commonProps,
          deposit_type: 123,
        },
      })
    ).toThrow()
  })
})
