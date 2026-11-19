import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayDepositBlocked',
    properties: {
      ...commonProps,
      deposit_type: 'internal',
      reason: 'insufficient_gas',
    },
  },
]

describe('PayDepositBlocked', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayDepositBlocked" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayDepositBlocked" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayDepositBlocked" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid deposit_type type', () => {
    expect(() =>
      validate({
        event: 'PayDepositBlocked',
        properties: {
          ...commonProps,
          deposit_type: 123,
          reason: 'insufficient_gas',
        },
      })
    ).toThrow()
  })

  it('Should reject invalid reason type', () => {
    expect(() =>
      validate({
        event: 'PayDepositBlocked',
        properties: {
          ...commonProps,
          deposit_type: 'internal',
          reason: 123,
        },
      })
    ).toThrow()
  })
})
