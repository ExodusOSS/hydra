import createIOC from '@exodus/argo'
import createLogger from '@exodus/logger'

import { atom, dependencies } from './dependencies.js'

jest.doMock('@exodus/analytics-validation', () => ({
  __esModule: true,
  default: () => {
    throw new Error('Always-failing validation')
  },
}))

const { default: analytics } = await import('../src/index.js')

describe('analytics feature', () => {
  const analyticsConfig = { segmentConfig: { apiKey: 'abc' } }

  test('does not explode', () => {
    const ioc = createIOC({ adapters: { createLogger } })
      .registerMultiple(dependencies)
      .use(analytics(analyticsConfig))
      .register({
        definition: {
          override: true,
          id: 'analyticsUserIdAtom',
          type: 'atom',
          factory: () => atom('abc'),
        },
      })

    ioc.resolve()

    const plugin = ioc.get('analyticsLifecyclePlugin')
    expect(() => plugin.onUnlock()).not.toThrow()
    expect(() => plugin.onStop()).not.toThrow()
  })
})
