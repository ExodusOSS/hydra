import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { commonProps, validate } from './mainschema.js'

const mainSchema = JSON.parse(
  readFileSync(join(import.meta.dirname, '../main.schemasafe.json'), 'utf8')
)
const schemaRefs = new Set(mainSchema.anyOf[0].oneOf.map((schema: { $ref: string }) => schema.$ref))

const eventNameToRef = (eventName: string) =>
  `${eventName.replace(/([\da-z])([A-Z])/g, '$1-$2').toLowerCase()}#`

const fixtures = [
  {
    event: 'StocksOnboardingView',
    properties: {
      ...commonProps,
    },
  },
  {
    event: 'StocksOnboardingComplete',
    properties: {
      ...commonProps,
    },
  },
  {
    event: 'StocksGeoBlockedView',
    properties: {
      ...commonProps,
    },
  },
  {
    event: 'StocksHomeView',
    properties: {
      ...commonProps,
    },
  },
  {
    event: 'StocksAssetDetailView',
    properties: {
      ...commonProps,
      asset: 'AAPL',
    },
  },
  {
    event: 'StocksBuyView',
    properties: {
      ...commonProps,
      asset: 'TSLA',
    },
  },
  {
    event: 'StocksBuyAmountView',
    properties: {
      ...commonProps,
      asset: 'NVDA',
      origin: 'wallet',
      balance_usd: 250,
    },
  },
  {
    event: 'StocksBuyAmountValid',
    properties: {
      ...commonProps,
      asset: 'NVDA',
      amount_usd: 50,
      balance_usd: 250,
    },
  },
  {
    event: 'StocksBuyAmountReady',
    properties: {
      ...commonProps,
      asset: 'NVDA',
      amount_usd: 50,
      time_to_ready_s: 1,
    },
  },
  {
    event: 'StocksBuyAmountDismissed',
    properties: {
      ...commonProps,
      asset: 'NVDA',
      amount_usd: 50,
      button_ready: true,
      error_type: 'insufficient_balance',
      balance_usd: 12,
      duration_s: 8,
    },
  },
  {
    event: 'StocksBuyBlocked',
    properties: {
      ...commonProps,
      asset: 'NVDA',
      amount_usd: 50,
      error_type: 'insufficient_balance',
      balance_usd: 0,
    },
  },
  {
    event: 'StocksBuyDepositTap',
    properties: {
      ...commonProps,
      asset: 'NVDA',
      amount_usd: 50,
      balance_usd: 0,
    },
  },
  {
    event: 'StocksBuyConfirmView',
    properties: {
      ...commonProps,
      asset: 'MSFT',
      amount_usd: 50,
      time_to_buy_s: 9,
    },
  },
  {
    event: 'StocksBuyConfirmReady',
    properties: {
      ...commonProps,
      asset: 'MSFT',
      amount_usd: 50,
      time_to_ready_s: 5,
    },
  },
  {
    event: 'StocksBuyConfirmBlocked',
    properties: {
      ...commonProps,
      asset: 'MSFT',
      amount_usd: 50,
      error_type: 'quote_timeout',
    },
  },
  {
    event: 'StocksBuyConfirmDismissed',
    properties: {
      ...commonProps,
      asset: 'MSFT',
      amount_usd: 50,
      confirm_ready: false,
      duration_s: 31,
    },
  },
  {
    event: 'StocksBuy',
    properties: {
      ...commonProps,
      asset: 'AMZN',
      amount_usd: 150.25,
      confirm_ready_s: 5,
      time_to_confirm_s: 12,
    },
  },
  {
    event: 'StocksBuySuccess',
    properties: {
      ...commonProps,
      asset: 'AMZN',
      amount_usd: 150.25,
      exchange_s: 2,
    },
  },
  {
    event: 'StocksSellView',
    properties: {
      ...commonProps,
      asset: 'GOOGL',
    },
  },
  {
    event: 'StocksSellConfirmView',
    properties: {
      ...commonProps,
      asset: 'META',
    },
  },
  {
    event: 'StocksSellConfirmReady',
    properties: {
      ...commonProps,
      asset: 'META',
      amount_usd: 50,
      time_to_ready_s: 5,
    },
  },
  {
    event: 'StocksSellConfirmBlocked',
    properties: {
      ...commonProps,
      asset: 'META',
      amount_usd: 50,
      error_type: 'no_quote',
    },
  },
  {
    event: 'StocksSellConfirmDismissed',
    properties: {
      ...commonProps,
      asset: 'META',
      amount_usd: 50,
      confirm_ready: true,
      duration_s: 4,
    },
  },
  {
    event: 'StocksSell',
    properties: {
      ...commonProps,
      asset: 'NFLX',
      amount_usd: 99.5,
      confirm_ready_s: 5,
      time_to_confirm_s: 12,
    },
  },
  {
    event: 'StocksSellSuccess',
    properties: {
      ...commonProps,
      asset: 'NFLX',
      amount_usd: 99.5,
      exchange_s: 2,
    },
  },
  {
    event: 'StocksBuyOrderCompleted',
    properties: {
      ...commonProps,
      asset: 'SPY',
      amount_usd: 1000,
      duration_s: 45,
    },
  },
  {
    event: 'StocksBuyOrderFailed',
    properties: {
      ...commonProps,
      asset: 'SPY',
      amount_usd: 1000,
      duration_s: 1200,
    },
  },
  {
    event: 'StocksSellOrderCompleted',
    properties: {
      ...commonProps,
      asset: 'NFLX',
      amount_usd: 99.5,
      duration_s: 30,
    },
  },
  {
    event: 'StocksSellOrderFailed',
    properties: {
      ...commonProps,
      asset: 'NFLX',
      amount_usd: 99.5,
      duration_s: 900,
    },
  },
  {
    event: 'StocksPortfolioView',
    properties: {
      ...commonProps,
    },
  },
  {
    event: 'StocksPortfolioAssetTap',
    properties: {
      ...commonProps,
      asset: 'AMD',
    },
  },
  {
    event: 'StocksBuyError',
    properties: {
      ...commonProps,
      asset: 'INTC',
      error_type: 'trade_failed',
      failure_reason: 'InvalidFromTokenAddressError',
    },
  },
  {
    event: 'StocksSellError',
    properties: {
      ...commonProps,
      asset: 'PYPL',
      error_type: 'compliance_check',
      failure_reason: 'region_restricted',
    },
  },
  {
    event: 'StocksBuyAddCashTap',
    properties: {
      ...commonProps,
      asset: 'AAPL',
      amount_usd: 100,
      balance_usd: 40,
      shortfall_usd: 60,
    },
  },
  {
    event: 'StocksFundAmountView',
    properties: {
      ...commonProps,
      origin: 'buy_insufficient',
      balance_usd: 120.5,
      amount_prefilled_usd: 60,
    },
  },
  {
    event: 'StocksFundConfirmView',
    properties: {
      ...commonProps,
      amount_usd: 60,
    },
  },
  {
    event: 'StocksFund',
    properties: {
      ...commonProps,
      amount_usd: 60,
    },
  },
  {
    event: 'StocksFundSuccess',
    properties: {
      ...commonProps,
      amount_usd: 60,
      duration_s: 3,
    },
  },
  {
    event: 'StocksFundError',
    properties: {
      ...commonProps,
      error_type: 'transfer_failed',
      amount_usd: 60,
    },
  },
  {
    event: 'StocksFundBlocked',
    properties: {
      ...commonProps,
      error_type: 'NOT_ENOUGH_BALANCE',
      amount_usd: 60,
      balance_usd: 12,
    },
  },
  {
    event: 'StocksFundAmountDismissed',
    properties: {
      ...commonProps,
      amount_usd: 60,
      button_ready: false,
      error_type: 'ZERO_BALANCE',
      balance_usd: 0,
      duration_s: 14,
    },
  },
  {
    event: 'StocksFundConfirmDismissed',
    properties: {
      ...commonProps,
      amount_usd: 60,
      confirm_ready: true,
      duration_s: 9,
    },
  },
  {
    event: 'StocksFundDepositTap',
    properties: {
      ...commonProps,
      balance_usd: 0,
      amount_usd: 60,
    },
  },
  {
    event: 'StocksWithdrawAmountView',
    properties: {
      ...commonProps,
      balance_usd: 200,
    },
  },
  {
    event: 'StocksWithdrawConfirmView',
    properties: {
      ...commonProps,
      amount_usd: 200,
      withdraw_all: true,
    },
  },
  {
    event: 'StocksWithdraw',
    properties: {
      ...commonProps,
      amount_usd: 200,
      withdraw_all: true,
    },
  },
  {
    event: 'StocksWithdrawSuccess',
    properties: {
      ...commonProps,
      amount_usd: 200,
      duration_s: 4.2,
    },
  },
  {
    event: 'StocksWithdrawError',
    properties: {
      ...commonProps,
      error_type: 'transfer_failed',
      amount_usd: 200,
    },
  },
  {
    event: 'StocksWithdrawBlocked',
    properties: {
      ...commonProps,
      error_type: 'PAIR_UNAVAILABLE',
      amount_usd: 200,
      balance_usd: 200,
    },
  },
  {
    event: 'StocksWithdrawAmountDismissed',
    properties: {
      ...commonProps,
      amount_usd: 200,
      button_ready: true,
      duration_s: 21,
    },
  },
  {
    event: 'StocksWithdrawConfirmDismissed',
    properties: {
      ...commonProps,
      amount_usd: 200,
      confirm_ready: true,
      duration_s: 6,
    },
  },
]

describe('Wealth Stocks events', () => {
  it('Should ensure every wealth fixture has an explicit main schema entry', () => {
    fixtures.forEach(({ event }) => {
      expect(schemaRefs.has(eventNameToRef(event))).toBe(true)
    })
  })

  fixtures.forEach((event) => {
    it(`The main schema validates "${event.event}" event`, () => {
      expect(validate(event)).toEqual(event)
    })

    it(`The main schema rejects unexpected top-level properties of "${event.event}" event`, () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it(`The main schema rejects unexpected nested properties of "${event.event}" event`, () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, test: true },
        })
      ).toThrow()
    })
  })

  it('Should reject invalid "asset" type', () => {
    expect(() =>
      validate({
        event: 'StocksAssetDetailView',
        properties: {
          ...commonProps,
          asset: 123,
        },
      })
    ).toThrow()
  })

  it('Should reject invalid "amount_usd" type', () => {
    expect(() =>
      validate({
        event: 'StocksBuy',
        properties: {
          ...commonProps,
          asset: 'AAPL',
          amount_usd: '100',
        },
      })
    ).toThrow()
  })

  it('Should reject invalid "error_type" type', () => {
    expect(() =>
      validate({
        event: 'StocksBuyError',
        properties: {
          ...commonProps,
          asset: 'AAPL',
          error_type: false,
          failure_reason: 'provider_error',
        },
      })
    ).toThrow()
  })

  it('Should reject invalid "failure_reason" type', () => {
    expect(() =>
      validate({
        event: 'StocksSellError',
        properties: {
          ...commonProps,
          asset: 'AAPL',
          error_type: 'network_error',
          failure_reason: 404,
        },
      })
    ).toThrow()
  })

  it('Should reject invalid "origin" value', () => {
    expect(() =>
      validate({
        event: 'StocksFundAmountView',
        properties: {
          ...commonProps,
          origin: 'settings',
          balance_usd: 120.5,
        },
      })
    ).toThrow()
  })

  it.each(['StocksFundError', 'StocksWithdrawError'])(
    'Should accept "NO_QUOTE" error type for "%s"',
    (event) => {
      const payload = {
        event,
        properties: {
          ...commonProps,
          error_type: 'NO_QUOTE',
        },
      }

      expect(validate(payload)).toEqual(payload)
    }
  )

  it.each(['StocksFundError', 'StocksWithdrawError'])(
    'Should reject invalid "error_type" value for "%s"',
    (event) => {
      expect(() =>
        validate({
          event,
          properties: {
            ...commonProps,
            error_type: 'unknown_error',
          },
        })
      ).toThrow()
    }
  )

  it.each(['StocksFundBlocked', 'StocksWithdrawBlocked'])(
    'Should reject invalid blocker "error_type" value for "%s"',
    (event) => {
      expect(() =>
        validate({
          event,
          properties: {
            ...commonProps,
            error_type: 'UNKNOWN_REASON',
          },
        })
      ).toThrow()
    }
  )

  it.each([
    'StocksBuyOrderCompleted',
    'StocksBuyOrderFailed',
    'StocksSellOrderCompleted',
    'StocksSellOrderFailed',
  ])('Should reject a negative "amount_usd" or "duration_s" for "%s"', (event) => {
    expect(() =>
      validate({ event, properties: { ...commonProps, asset: 'SPY', amount_usd: -1 } })
    ).toThrow()
    expect(() =>
      validate({ event, properties: { ...commonProps, asset: 'SPY', duration_s: -1 } })
    ).toThrow()
  })

  it('Should reject invalid "withdraw_all" type', () => {
    expect(() =>
      validate({
        event: 'StocksWithdraw',
        properties: {
          ...commonProps,
          amount_usd: 200,
          withdraw_all: 'yes',
        },
      })
    ).toThrow()
  })
})
