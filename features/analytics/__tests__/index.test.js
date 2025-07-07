import createIOC from '@exodus/argo'
import createLogger from '@exodus/logger'

import { atom, dependencies } from './dependencies.js'

jest.doMock('@exodus/analytics-validation', () => ({
  __esModule: true,
  default: () => {
    throw new Error('Always-failing validation')
  },
}))

const { default: analytics } = await import('../index.js')

describe('analytics feature', () => {
  const analyticsConfig = { segmentConfig: { apiKey: 'abc' } }

  test('does not explode', () => {
    const ioc = createIOC({ adapters: { createLogger } })
      .registerMultiple(dependencies)
      .use(analytics(analyticsConfig))

    ioc.resolve()

    expect(ioc.getAll().analyticsExtraSeedsUserIdsAtom).toBeDefined()
  })

  test('omits seed related nodes when multiSeed is false', () => {
    const ioc = createIOC({ adapters: { createLogger } })
      .registerMultiple(dependencies)
      .use(analytics({ ...analyticsConfig, multiSeed: false }))
      .register({
        definition: {
          override: true,
          id: 'analyticsUserIdAtom',
          type: 'atom',
          factory: () => atom('abc'),
        },
      })

    ioc.resolve()

    expect(ioc.getAll().analyticsExtraSeedsUserIdsAtom).toBeUndefined()

    const plugin = ioc.get('analyticsLifecyclePlugin')
    expect(() => plugin.onUnlock()).not.toThrow()
    expect(() => plugin.onStop()).not.toThrow()
  })
})
