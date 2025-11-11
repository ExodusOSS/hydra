import { describe, test } from 'node:test'

import { safeString } from '@exodus/safe-string'

import { SafeContext } from '../../safe-context/index.js'

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
]

describe('SafeContext.parse', () => {
  for (const fixture of fixtures) {
    test(`should parse unsafe context`, () => {
      const safeContext = SafeContext.parse(fixture.context)
      expect(safeContext).toEqual(fixture.expectedSafeContext)
    })
  }
})
