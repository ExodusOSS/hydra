import { commonProps, validate } from './mainschema.js'

// Global properties injected by `useTrackPrediction` in exodus-mobile on every
// Predictions event. Kept as a constant so we can spread it into each fixture
// and assert that the schema accepts the full set on every event.
const predictionsGlobals = {
  funded_state: 'funded' as const,
  entry_source: 'tab_nav',
  prediction_account_activated: true,
  view_mode: 'card' as const,
  balance_usd_at_event: 42.5,
  provider: 'polymarket' as const,
  market_type: 'binary' as const,
  user_type: 'existing_wallet',
}

const fixtures = [
  {
    event: 'PayPredictionsOpen',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      is_first_open: true,
    },
  },
  {
    event: 'PayPredictionsBannerView',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      surface: 'wallet_carousel',
    },
  },
  {
    event: 'PayPredictionsAccountActivate',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
    },
  },
  {
    event: 'PayPredictionsViewModeChange',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      from_mode: 'card',
      to_mode: 'list',
    },
  },
  {
    event: 'PayPredictionsTabSelect',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      tab_name: 'trending',
      tab_position: 2,
    },
  },
  {
    event: 'PayPredictionsSearch',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      query_length: 5,
      results_count: 17,
    },
  },
  {
    event: 'PayPredictionsMarketView',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      market_id: 'mkt_123',
      market_category: 'weather',
      market_question: 'Will it rain tomorrow?',
      options_count: 2,
      time_remaining_seconds: 3600,
      market_volume_usd: 50_000,
      surface: 'feed',
      position: 3,
    },
  },
  {
    event: 'PayPredictionsMarketSwipe',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      market_id: 'mkt_123',
      direction: 'left',
      view_duration_ms: 1500,
    },
  },
  {
    event: 'PayPredictionsMarketDetailOpen',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      market_id: 'mkt_123',
      source_surface: 'feed',
    },
  },
  {
    event: 'PayPredictionsBuyStart',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      market_id: 'mkt_123',
      option_selected: 'Yes',
      option_id: '0',
      option_price: 0.42,
      reward_pct: 1.38,
      available_balance_usd: 100,
      is_position_existing: false,
    },
  },
  {
    event: 'PayPredictionsBuyOptionChange',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      market_id: 'mkt_123',
      from_option_id: '0',
      to_option_id: '1',
      from_option_price: 0.42,
      to_option_price: 0.58,
      amount_entered_usd: 10,
    },
  },
  {
    event: 'PayPredictionsBuyInsufficientFunds',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      market_id: 'mkt_123',
      amount_attempted_usd: 100,
      balance_usd: 20,
      shortfall_usd: 80,
    },
  },
  {
    event: 'PayPredictionsBuyFundTrigger',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      market_id: 'mkt_123',
      amount_attempted_usd: 100,
    },
  },
  {
    event: 'PayPredictionsBuyConfirm',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      market_id: 'mkt_123',
      option_id: '0',
      amount_usd: 10,
      fee_usd: 0.25,
      reward_pct: 1.38,
      expected_payout_usd: 23.8,
    },
  },
  {
    event: 'PayPredictionsBuySuccess',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      market_id: 'mkt_123',
      option_id: '0',
      position_id: 'pos_1',
      amount_usd: 10,
      fee_usd: 0.25,
      builder_fee_usd: 0.1,
      platform_fee_usd: 0.15,
      reward_pct: 1.38,
      expected_payout_usd: 23.8,
      is_first_buy: true,
      latency_ms: 750,
    },
  },
  {
    event: 'PayPredictionsBuyAbandonDuringProcessing',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      market_id: 'mkt_123',
      option_id: '0',
      amount_usd: 10,
      ms_in_pending_state: 2400,
    },
  },
  {
    event: 'PayPredictionsBuyFail',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      market_id: 'mkt_123',
      option_id: '0',
      amount_usd: 10,
      failure_reason: 'network',
      error_code: 'ERR_NETWORK',
    },
  },
  {
    event: 'PayPredictionsFundEntry',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      source: 'insufficient_funds',
      market_id: 'mkt_123',
      amount_prefilled_usd: 80,
    },
  },
  {
    event: 'PayPredictionsFundSuccess',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      amount_usd: 80,
      fee_usd: 0.4,
      source: 'insufficient_funds',
      is_first_fund: true,
      latency_ms: 1200,
    },
  },
  {
    event: 'PayPredictionsFundFail',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      amount_usd: 80,
      failure_reason: 'geoblocked',
      source: 'empty_state',
    },
  },
  {
    event: 'PayPredictionsSellStart',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      position_id: 'pos_1',
      market_id: 'mkt_123',
      current_position_value_usd: 5.25,
      cost_basis_usd: 4.5,
      unrealized_pnl_usd: -0.75,
    },
  },
  {
    event: 'PayPredictionsSellSuccess',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      position_id: 'pos_1',
      market_id: 'mkt_123',
      sell_amount_usd: 5.25,
      fee_usd: 0.1,
      builder_fee_usd: 0.0525,
      platform_fee_usd: 0.0475,
      realized_pnl_usd: -0.75,
      is_first_sell: true,
    },
  },
  {
    event: 'PayPredictionsSellFail',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      position_id: 'pos_1',
      market_id: 'mkt_123',
      sell_amount_usd: 5.25,
      failure_reason: 'provider_error',
      error_code: 'ERR_PROVIDER',
    },
  },
  {
    event: 'PayPredictionsWithdrawStart',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
    },
  },
  {
    event: 'PayPredictionsWithdrawSuccess',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      amount_usd: 25,
      fee_usd: 0.5,
      latency_ms: 900,
    },
  },
  {
    event: 'PayPredictionsWithdrawFail',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      amount_usd: 25,
      failure_reason: 'already_in_progress',
    },
  },
  {
    event: 'PayPredictionsFundSettled',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      amount_usd: 50,
      latency_ms: 95_000,
    },
  },
  {
    event: 'PayPredictionsFundSettlementFailed',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      amount_usd: 50,
      latency_ms: 600_000,
    },
  },
  {
    event: 'PayPredictionsWithdrawSettled',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      amount_usd: 25,
      latency_ms: 120_000,
    },
  },
  {
    event: 'PayPredictionsWithdrawSettlementFailed',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      amount_usd: 25,
      latency_ms: 300_000,
    },
  },
  {
    event: 'PayPredictionsPositionView',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      position_id: 'pos_1',
      market_id: 'mkt_123',
      current_value_usd: 5.25,
      cost_basis_usd: 6,
      unrealized_pnl_usd: -0.75,
      unrealized_pnl_pct: -12.5,
      time_to_resolution_seconds: -3600,
    },
  },
  {
    event: 'PayPredictionsPositionTap',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      position_id: 'pos_1',
      market_id: 'mkt_123',
      unrealized_pnl_pct: -12.5,
    },
  },
  {
    event: 'PayPredictionsPositionsSeeAll',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      active_positions_count: 8,
    },
  },
  {
    event: 'PayPredictionsMarketResolve',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      position_id: 'pos_1',
      market_id: 'mkt_123',
      outcome: 'won',
      payout_usd: 12,
      cost_basis_usd: 6,
      realized_pnl_usd: 6,
      source: 'client',
    },
  },
  {
    event: 'PayPredictionsWinningsClaim',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      position_id: 'pos_1',
      market_id: 'mkt_123',
      payout_usd: 12,
      claim_method: 'manual',
      is_first_claim: true,
    },
  },
  {
    event: 'PayPredictionsHistoryView',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      positions_count: 17,
      active_count: 5,
      resolved_count: 12,
    },
  },
  {
    event: 'PayPredictionsHistoryItemTap',
    properties: {
      ...commonProps,
      ...predictionsGlobals,
      position_id: 'pos_1',
      market_id: 'mkt_123',
      position_status: 'won',
    },
  },
]

const withProperty = (eventName: string, property: string, value: unknown) => {
  const fixture = fixtures.find(({ event }) => event === eventName)
  if (!fixture) throw new Error(`No fixture for ${eventName}`)
  return { event: eventName, properties: { ...fixture.properties, [property]: value } }
}

const acceptedValues = [
  ...['wallet_carousel', 'pay_home', 'profile'].map((value) => ({
    event: 'PayPredictionsBannerView',
    property: 'surface',
    value,
  })),
  ...['wallet_banner', 'pay_home_tab', 'profile_card'].map((value) => ({
    event: 'PayPredictionsOpen',
    property: 'entry_source',
    value,
  })),
  ...[
    'provider_error',
    'network',
    'geoblocked',
    'quote_unavailable',
    'user_cancelled',
    'other',
  ].map((value) => ({
    event: 'PayPredictionsFundFail',
    property: 'failure_reason',
    value,
  })),
  ...[
    'provider_error',
    'network',
    'already_in_progress',
    'quote_unavailable',
    'user_cancelled',
    'other',
  ].map((value) => ({
    event: 'PayPredictionsWithdrawFail',
    property: 'failure_reason',
    value,
  })),
]

const rejectedValues = [
  { event: 'PayPredictionsBannerView', property: 'surface', value: 'settings' },
  { event: 'PayPredictionsOpen', property: 'entry_source', value: 'push_notification' },
  { event: 'PayPredictionsFundSuccess', property: 'source', value: 'card_deposit' },
  { event: 'PayPredictionsFundFail', property: 'source', value: 'card_deposit' },
  {
    event: 'PayPredictionsFundFail',
    property: 'failure_reason',
    value: 'Request failed with status 402: card ending 4242 declined',
  },
  {
    event: 'PayPredictionsFundFail',
    property: 'error_code',
    value: 'Request failed with status 402: card ending 4242 declined',
  },
  { event: 'PayPredictionsWithdrawFail', property: 'failure_reason', value: 'geoblocked' },
  {
    event: 'PayPredictionsWithdrawFail',
    property: 'error_code',
    value: 'Withdrawal to 0x52908400098527886E0F7030069857D2E4169EE7 failed',
  },
  { event: 'PayPredictionsFundSuccess', property: 'amount_usd', value: -1 },
  { event: 'PayPredictionsWithdrawSuccess', property: 'amount_usd', value: -1 },
  { event: 'PayPredictionsWithdrawSuccess', property: 'fee_usd', value: -0.5 },
  { event: 'PayPredictionsFundSuccess', property: 'fee_usd', value: -0.5 },
  { event: 'PayPredictionsFundFail', property: 'amount_usd', value: -1 },
  { event: 'PayPredictionsWithdrawFail', property: 'amount_usd', value: -1 },
  ...['PayPredictionsBuySuccess', 'PayPredictionsSellSuccess'].flatMap((event) => [
    { event, property: 'builder_fee_usd', value: -0.1 },
    { event, property: 'platform_fee_usd', value: -0.1 },
  ]),
  { event: 'PayPredictionsSellSuccess', property: 'fee_usd', value: -0.1 },
  ...[
    'PayPredictionsFundSettled',
    'PayPredictionsFundSettlementFailed',
    'PayPredictionsWithdrawSettled',
    'PayPredictionsWithdrawSettlementFailed',
  ].flatMap((event) => [
    { event, property: 'amount_usd', value: -1 },
    { event, property: 'latency_ms', value: -1 },
  ]),
]

describe('Predictions events', () => {
  fixtures.forEach((fixture) => {
    describe(fixture.event, () => {
      it(`validates "${fixture.event}" with all global + event-specific properties`, () => {
        expect(validate(fixture)).toEqual(fixture)
      })

      it(`rejects unexpected top-level properties on "${fixture.event}"`, () => {
        expect(() => validate({ ...fixture, test: true })).toThrow()
      })

      it(`rejects unexpected nested properties on "${fixture.event}"`, () => {
        expect(() =>
          validate({
            event: fixture.event,
            properties: { ...fixture.properties, unknown_property: true },
          })
        ).toThrow()
      })
    })
  })

  it('accepts a Predictions event with only the global properties', () => {
    const event = {
      event: 'PayPredictionsAccountActivate',
      properties: { ...commonProps, ...predictionsGlobals },
    }
    expect(validate(event)).toEqual(event)
  })

  it.each([
    'PayPredictionsFundSettled',
    'PayPredictionsFundSettlementFailed',
    'PayPredictionsWithdrawSettled',
    'PayPredictionsWithdrawSettlementFailed',
  ])('accepts "%s" without the UI globals, as the background sends it', (eventName) => {
    const event = {
      event: eventName,
      properties: { ...commonProps, amount_usd: 10, latency_ms: 1 },
    }
    expect(validate(event)).toEqual(event)
  })

  it('rejects an unknown funded_state value', () => {
    expect(() =>
      validate({
        event: 'PayPredictionsOpen',
        properties: {
          ...commonProps,
          ...predictionsGlobals,
          funded_state: 'partially_funded',
          is_first_open: true,
        },
      })
    ).toThrow()
  })

  it('rejects an unknown provider value', () => {
    expect(() =>
      validate({
        event: 'PayPredictionsOpen',
        properties: {
          ...commonProps,
          ...predictionsGlobals,
          provider: 'manifold',
          is_first_open: true,
        },
      })
    ).toThrow()
  })

  it('rejects a non-numeric balance_usd_at_event', () => {
    expect(() =>
      validate({
        event: 'PayPredictionsOpen',
        properties: {
          ...commonProps,
          ...predictionsGlobals,
          balance_usd_at_event: '10',
          is_first_open: true,
        },
      })
    ).toThrow()
  })

  it('rejects an unknown failure_reason on PayPredictionsBuyFail', () => {
    expect(() =>
      validate({
        event: 'PayPredictionsBuyFail',
        properties: {
          ...commonProps,
          ...predictionsGlobals,
          market_id: 'mkt_123',
          option_id: '0',
          amount_usd: 10,
          failure_reason: 'meteor_strike',
          error_code: 'ERR_UNKNOWN',
        },
      })
    ).toThrow()
  })

  acceptedValues.forEach(({ event, property, value }) => {
    it(`accepts ${property} "${value}" on "${event}"`, () => {
      const candidate = withProperty(event, property, value)
      expect(validate(candidate)).toEqual(candidate)
    })
  })

  rejectedValues.forEach(({ event, property, value }) => {
    it(`rejects ${property} ${JSON.stringify(value)} on "${event}"`, () => {
      expect(() => validate(withProperty(event, property, value))).toThrow()
    })
  })
})
