import { commonProps, validate } from './mainschema.js'

const attemptedEvent = {
  event: 'RebalancingAttempted',
  properties: {
    ...commonProps,
    source_asset: 'usdcsol',
    target_asset: 'usdcoin',
    amount_usd: 125.5,
    attempt_number: 1,
  },
}

const broadcastEvent = {
  event: 'RebalancingBroadcast',
  properties: {
    ...commonProps,
    source_asset: 'usdcsol',
    target_asset: 'usdcoin',
    amount_usd: 125.5,
    attempt_number: 1,
    duration_ms: 1250,
  },
}

const failedEvent = {
  event: 'RebalancingFailed',
  properties: {
    ...commonProps,
    source_asset: 'usdcsol',
    target_asset: 'usdcoin',
    amount_usd: 125.5,
    attempt_number: 2,
    duration_ms: 2500,
    failure_reason_type: 'broadcast',
    retry_backoff_ms: 60_000,
  },
}

const fixtures = [attemptedEvent, broadcastEvent, failedEvent]

const errorTypes = [
  'wallet_locked',
  'timeout',
  'network_error',
  'rate_limited',
  'rewards_not_joined',
  'phone_verification_required',
  'asset_disabled',
  'service_unavailable',
  'server_error',
  'request_rejected',
  'simulation_failed',
  'insufficient_gas',
  'insufficient_balance',
  'nonce_conflict',
  'chain_rpc_error',
  'broadcast_rejected',
  'unknown',
]

const payOrderId = 'k3x9q2m7v8p1r4t6w0y5z2ab'

const requiredPropertiesByEvent = [
  {
    fixture: attemptedEvent,
    properties: ['source_asset', 'target_asset', 'amount_usd', 'attempt_number'],
  },
  {
    fixture: broadcastEvent,
    properties: ['source_asset', 'target_asset', 'amount_usd', 'attempt_number', 'duration_ms'],
  },
  {
    fixture: failedEvent,
    properties: [
      'source_asset',
      'target_asset',
      'amount_usd',
      'attempt_number',
      'duration_ms',
      'failure_reason_type',
      'retry_backoff_ms',
    ],
  },
]

describe('Rebalancing events', () => {
  it.each(fixtures)('validates $event', (fixture) => {
    expect(validate(fixture)).toEqual(fixture)
  })

  it.each(fixtures)('validates $event with a pay_order_id', (fixture) => {
    const event = { ...fixture, properties: { ...fixture.properties, pay_order_id: payOrderId } }

    expect(validate(event)).toEqual(event)
  })

  it.each(fixtures)('rejects a pay_order_id that is not a cuid2 on $event', (fixture) => {
    for (const value of [
      '7f3c2a1e-9b4d-4c8a-a6f2-0e5d3b9c1a47',
      payOrderId.slice(0, 19),
      payOrderId.padEnd(33, 'a'),
      payOrderId.toUpperCase(),
    ]) {
      expect(() =>
        validate({ ...fixture, properties: { ...fixture.properties, pay_order_id: value } })
      ).toThrow()
    }
  })

  it.each(fixtures)('rejects the retired rebalance_id on $event', (fixture) => {
    expect(() =>
      validate({
        ...fixture,
        properties: {
          ...fixture.properties,
          rebalance_id: '7f3c2a1e-9b4d-4c8a-a6f2-0e5d3b9c1a47',
        },
      })
    ).toThrow()
  })

  it.each(['broadcast', 'chain', 'pay_order'])('validates confirmed_by "%s"', (confirmedBy) => {
    const event = {
      ...broadcastEvent,
      properties: { ...broadcastEvent.properties, confirmed_by: confirmedBy },
    }

    expect(validate(event)).toEqual(event)
  })

  it('rejects an unknown confirmed_by', () => {
    expect(() =>
      validate({
        ...broadcastEvent,
        properties: { ...broadcastEvent.properties, confirmed_by: 'unknown' },
      })
    ).toThrow()
  })

  it.each(['create_deposit_transaction', 'transfer', 'broadcast', 'broadcast_unconfirmed'])(
    'validates failure_reason_type "%s"',
    (failureReasonType) => {
      const event = {
        ...failedEvent,
        properties: { ...failedEvent.properties, failure_reason_type: failureReasonType },
      }

      expect(validate(event)).toEqual(event)
    }
  )

  requiredPropertiesByEvent.forEach(({ fixture, properties }) => {
    it.each(properties)(`rejects ${fixture.event} without %s`, (property) => {
      const event = {
        ...fixture,
        properties: Object.fromEntries(
          Object.entries(fixture.properties).filter(([key]) => key !== property)
        ),
      }

      expect(() => validate(event)).toThrow()
    })
  })

  it.each(fixtures)('rejects a non-positive amount_usd on $event', (fixture) => {
    expect(() =>
      validate({ ...fixture, properties: { ...fixture.properties, amount_usd: 0 } })
    ).toThrow()
  })

  it('rejects an unknown failure_reason_type', () => {
    expect(() =>
      validate({
        ...failedEvent,
        properties: { ...failedEvent.properties, failure_reason_type: 'unknown' },
      })
    ).toThrow()
  })

  it.each(errorTypes)('validates error_type "%s"', (errorType) => {
    const event = {
      ...failedEvent,
      properties: { ...failedEvent.properties, error_type: errorType },
    }

    expect(validate(event)).toEqual(event)
  })

  it.each(['insufficient funds', 'Insufficient_Gas', '', null])(
    'rejects error_type "%s" outside the enum',
    (errorType) => {
      expect(() =>
        validate({
          ...failedEvent,
          properties: { ...failedEvent.properties, error_type: errorType },
        })
      ).toThrow()
    }
  )

  it.each(fixtures)('rejects unexpected top-level properties on $event', (fixture) => {
    expect(() => validate({ ...fixture, error: 'raw failure detail' })).toThrow()
  })

  it.each(['error', 'error_message', 'failure_reason'])(
    'rejects raw error property "%s"',
    (property) => {
      expect(() =>
        validate({
          ...failedEvent,
          properties: { ...failedEvent.properties, [property]: 'raw failure detail' },
        })
      ).toThrow()
    }
  )

  it.each([
    ['attempt_number', 0],
    ['attempt_number', 1.5],
    ['duration_ms', -1],
    ['duration_ms', 1.5],
    ['retry_backoff_ms', -1],
    ['retry_backoff_ms', 1.5],
  ])('rejects invalid %s metadata', (property, value) => {
    expect(() =>
      validate({
        ...failedEvent,
        properties: { ...failedEvent.properties, [property]: value },
      })
    ).toThrow()
  })
})
