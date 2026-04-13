import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayEarnRewardReceive',
    properties: {
      ...commonProps,
      amount_usd: '150.00',
    },
  },
]

describe('PayEarnRewardReceive', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayEarnRewardReceive" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayEarnRewardReceive" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayEarnRewardReceive" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid amount_usd type', () => {
    expect(() =>
      validate({
        event: 'PayEarnRewardReceive',
        properties: {
          ...commonProps,
          amount_usd: 150,
        },
      })
    ).toThrow()
  })
})
