import createFeatureControlSelectors from '../create-feature-control-selectors.js'

describe('createFeatureControlSelectors', () => {
  test('validates options', async () => {
    expect(() =>
      createFeatureControlSelectors({ featureConfigSelector: null, optsSelector: () => null }, {})
    ).toThrow('featureConfigSelector must be a function')

    expect(() =>
      createFeatureControlSelectors({ featureConfigSelector: () => null, optsSelector: null }, {})
    ).toThrow('optsSelector must be a function')
  })

  test('passes args correctly to feature control', async () => {
    const featureControlSelectors = createFeatureControlSelectors(
      {
        featureConfigSelector: () => ({ enabled: false }),
        optsSelector: () => ({ enabled: true, ready: true }),
      },
      { enabledOverride: true }
    )
    expect(() => featureControlSelectors.isOnSelector()).not.toThrow()
    expect(featureControlSelectors.isOnSelector()).toBe(false)
  })
})
