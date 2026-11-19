import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayPayContactAdd',
    properties: {
      ...commonProps,
      contact_account_type: 'bank',
      method: 'manual',
    },
  },
  {
    event: 'PayPayContactAdd',
    properties: {
      ...commonProps,
      contact_account_type: 'exodus-pay-user',
      method: 'qr-code',
    },
  },
]

describe('PayPayContactAdd', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayPayContactAdd" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayPayContactAdd" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayPayContactAdd" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid types', () => {
    expect(() =>
      validate({
        event: 'PayPayContactAdd',
        properties: {
          ...commonProps,
          contact_account_type: 123,
          method: 'manual',
        },
      })
    ).toThrow()
  })
})
