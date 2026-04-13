import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayReceive',
    properties: {
      ...commonProps,
      was_request: true,
      amount_usd: 50.25,
    },
  },
  {
    event: 'PayReceive',
    properties: {
      ...commonProps,
      was_request: false,
      amount_usd: 100,
    },
  },
]

describe('PayReceive', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayReceive" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayReceive" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayReceive" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid types', () => {
    expect(() =>
      validate({
        event: 'PayReceive',
        properties: {
          ...commonProps,
          was_request: 'yes',
          amount_usd: 50,
        },
      })
    ).toThrow()
  })
})
