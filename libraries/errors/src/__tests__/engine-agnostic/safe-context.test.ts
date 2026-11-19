import { describe, test } from 'node:test'

import { safeString } from '@exodus/safe-string'
import { TraceId } from '@exodus/traceparent'

import { SafeContext } from '../../safe-context/index.js'

const validTraceId = TraceId.fromRawTraceparent(
  '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01'
)

const fixtures = [
  {
    context: {
      navigation: { currentRouteName: 'route_name_1', previousRouteName: 'route_name_2' },
    },
    expectedSafeContext: undefined,
  },
  {
    context: {
      navigation: {
        currentRouteName: safeString`home`,
        previousRouteName: safeString`login`,
      },
    },
    expectedSafeContext: {
      navigation: { currentRouteName: 'home', previousRouteName: 'login' },
    },
  },
  {
    context: {
      reason: 'some user PII in error message',
      type: 'custom_error_type',
    },
    expectedSafeContext: undefined,
  },
  {
    context: {
      reason: safeString`nonce too low`,
      type: safeString`BROADCAST`,
    },
    expectedSafeContext: {
      reason: 'nonce too low',
      type: 'BROADCAST',
    },
  },
  {
    context: {
      reason: safeString`execution reverted`,
      type: safeString`BROADCAST`,
    },
    expectedSafeContext: {
      reason: 'execution reverted',
      type: 'BROADCAST',
    },
  },
  {
    context: {
      reason: safeString`balance fetch failed`,
      type: safeString`NODE_STATE_READ`,
    },
    expectedSafeContext: {
      reason: 'balance fetch failed',
      type: 'NODE_STATE_READ',
    },
  },
  {
    context: {
      reason: safeString`eth call failed`,
      type: safeString`CONTRACT_CALL`,
    },
    expectedSafeContext: {
      reason: 'eth call failed',
      type: 'CONTRACT_CALL',
    },
  },
  {
    context: {
      navigation: {
        currentRouteName: safeString`send`,
        previousRouteName: safeString`wallet`,
      },
      reason: safeString`insufficient funds for gas * price + value`,
      type: safeString`BROADCAST`,
    },
    expectedSafeContext: {
      navigation: { currentRouteName: 'send', previousRouteName: 'wallet' },
      reason: 'insufficient funds for gas * price + value',
      type: 'BROADCAST',
    },
  },
  {
    context: {
      navigation: {
        currentRouteName: safeString`swap`,
        previousRouteName: safeString`home`,
      },
      reason: 'Error: 0x1234abcd user wallet address leaked',
      type: safeString`BROADCAST`,
    },
    expectedSafeContext: undefined,
  },
  {
    context: {
      baseAssetName: safeString`ethereum`,
      reason: safeString`nonce too low`,
    },
    expectedSafeContext: {
      baseAssetName: 'ethereum',
      reason: 'nonce too low',
    },
  },
  {
    context: {
      baseAssetName: 'not_a_real_asset',
    },
    expectedSafeContext: undefined,
  },
  // traceId tests
  {
    context: {
      traceId: validTraceId,
      reason: safeString`network error`,
    },
    expectedSafeContext: {
      traceId: validTraceId,
      reason: 'network error',
    },
  },
  {
    context: {
      traceId: '0af7651916cd43dd8448eb211c80319c', // plain string should be rejected
      reason: safeString`network error`,
    },
    expectedSafeContext: undefined,
  },
  {
    context: {
      traceId: null,
      reason: safeString`network error`,
    },
    expectedSafeContext: {
      traceId: null,
      reason: 'network error',
    },
  },
  {
    context: {
      traceId: undefined,
      reason: safeString`network error`,
    },
    expectedSafeContext: {
      reason: 'network error',
    },
  },
  // exchange namespace tests
  {
    context: {
      exchange: {
        events: [safeString`CREATING_ORDER`, safeString`SENDING_TX`],
      },
    },
    expectedSafeContext: {
      exchange: {
        events: ['CREATING_ORDER', 'SENDING_TX'],
      },
    },
  },
  {
    context: {
      exchange: {
        events: ['unsafe user-controlled string'],
      },
    },
    expectedSafeContext: undefined,
  },
]

describe('SafeContext.parse', () => {
  for (const fixture of fixtures) {
    test(`should parse unsafe context`, () => {
      const safeContext = SafeContext.parse(fixture.context)
      expect(safeContext).toEqual(fixture.expectedSafeContext)
    })
  }
})
