import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayWithdrawConfirmView',
    properties: {
      ...commonProps,
      asset_name: 'USDC',
      network: 'solana',
      amount_usd: 100.5,
      token_type: 'stablecoin',
    },
  },
  {
    event: 'PayWithdrawConfirmView',
    properties: {
      ...commonProps,
      asset_name: 'USDT',
      network: 'ethereum',
      amount_usd: 50,
      token_type: 'stablecoin',
    },
  },
  {
    event: 'PayWithdrawConfirmView',
    properties: {
      ...commonProps,
      asset_name: 'BTC',
      network: 'bitcoin',
      amount_usd: 250,
      token_type: 'crypto',
    },
  },
]

describe('PayWithdrawConfirmView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayWithdrawConfirmView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayWithdrawConfirmView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayWithdrawConfirmView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid amount_usd type', () => {
    expect(() =>
      validate({
        event: 'PayWithdrawConfirmView',
        properties: {
          ...commonProps,
          asset_name: 'USDC',
          network: 'solana',
          amount_usd: '100',
          token_type: 'stablecoin',
        },
      })
    ).toThrow()
  })

  it('Should reject invalid asset_name type', () => {
    expect(() =>
      validate({
        event: 'PayWithdrawConfirmView',
        properties: {
          ...commonProps,
          asset_name: 123,
          network: 'solana',
          amount_usd: 100,
          token_type: 'stablecoin',
        },
      })
    ).toThrow()
  })

  it('Should reject invalid network type', () => {
    expect(() =>
      validate({
        event: 'PayWithdrawConfirmView',
        properties: {
          ...commonProps,
          asset_name: 'USDC',
          network: 123,
          amount_usd: 100,
          token_type: 'stablecoin',
        },
      })
    ).toThrow()
  })

  it('Should reject invalid token_type value', () => {
    expect(() =>
      validate({
        event: 'PayWithdrawConfirmView',
        properties: {
          ...commonProps,
          asset_name: 'USDC',
          network: 'solana',
          amount_usd: 100,
          token_type: 'invalid',
        },
      })
    ).toThrow()
  })
})
