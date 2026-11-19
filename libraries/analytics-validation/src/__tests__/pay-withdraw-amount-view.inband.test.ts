import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayWithdrawAmountView',
    properties: {
      ...commonProps,
      asset_name: 'USDC',
      network: 'solana',
      token_type: 'stablecoin',
    },
  },
  {
    event: 'PayWithdrawAmountView',
    properties: {
      ...commonProps,
      asset_name: 'USDT',
      network: 'ethereum',
      token_type: 'stablecoin',
    },
  },
  {
    event: 'PayWithdrawAmountView',
    properties: {
      ...commonProps,
      asset_name: 'BTC',
      network: 'bitcoin',
      token_type: 'crypto',
    },
  },
]

describe('PayWithdrawAmountView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayWithdrawAmountView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayWithdrawAmountView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayWithdrawAmountView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid asset_name type', () => {
    expect(() =>
      validate({
        event: 'PayWithdrawAmountView',
        properties: {
          ...commonProps,
          asset_name: 123,
          network: 'solana',
          token_type: 'stablecoin',
        },
      })
    ).toThrow()
  })

  it('Should reject invalid network type', () => {
    expect(() =>
      validate({
        event: 'PayWithdrawAmountView',
        properties: {
          ...commonProps,
          asset_name: 'USDC',
          network: 123,
          token_type: 'stablecoin',
        },
      })
    ).toThrow()
  })

  it('Should reject invalid token_type type', () => {
    expect(() =>
      validate({
        event: 'PayWithdrawAmountView',
        properties: {
          ...commonProps,
          asset_name: 'USDC',
          network: 'solana',
          token_type: 123,
        },
      })
    ).toThrow()
  })

  it('Should reject invalid token_type value', () => {
    expect(() =>
      validate({
        event: 'PayWithdrawAmountView',
        properties: {
          ...commonProps,
          asset_name: 'USDC',
          network: 'solana',
          token_type: 'invalid',
        },
      })
    ).toThrow()
  })
})
