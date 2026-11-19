import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayDeposit',
    properties: {
      ...commonProps,
      deposit_type: 'bank',
      asset: 'USD',
      network: '',
      bank: 'Chase',
      amount: 100,
      amount_usd: 100,
    },
  },
  {
    event: 'PayDeposit',
    properties: {
      ...commonProps,
      deposit_type: 'usdc',
      asset: 'USDC',
      network: 'Ethereum',
      bank: '',
      amount: 50,
      amount_usd: 50,
    },
  },
]

describe('PayDeposit', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayDeposit" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayDeposit" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayDeposit" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid amount type', () => {
    expect(() =>
      validate({
        event: 'PayDeposit',
        properties: {
          ...commonProps,
          deposit_type: 'bank',
          asset: 'USD',
          network: '',
          bank: 'Chase',
          amount: '100',
          amount_usd: 100,
        },
      })
    ).toThrow()
  })
})
