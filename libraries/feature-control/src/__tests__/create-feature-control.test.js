import createFeatureControl from '../create-feature-control.js'

describe('createFeatureControl validation', () => {
  test('validates modules', async () => {
    expect(() =>
      createFeatureControl({ enabled: true, ready: false }, { randomModule: true })
    ).toThrow(/must be one of available modules/)

    expect(() =>
      createFeatureControl(
        { enabled: true, ready: false, versionSemver: '1.0.0' },
        { shutdownSemver: true }
      )
    ).not.toThrow()
  })

  test('validates opts', async () => {
    expect(() => createFeatureControl({ enabled: true, ready: {} })).toThrow(
      /ready must be a boolean/
    )

    expect(() => createFeatureControl({ ready: true, enabled: {} })).toThrow(
      /enabled must be a boolean/
    )

    expect(() =>
      createFeatureControl({ enabled: true, ready: true }, { shutdownSemver: true })
    ).toThrow(/versionSemver must be a valid semver/)

    expect(() =>
      createFeatureControl(
        { enabled: true, ready: true, versionSemver: '1' },
        { shutdownSemver: true }
      )
    ).toThrow(/versionSemver must be a valid semver/)

    expect(() =>
      createFeatureControl({ enabled: true, ready: true }, { geolocation: true })
    ).toThrow(/geolocation must be an object/)

    expect(() => createFeatureControl({ enabled: true, ready: true }, { geolocation: [] })).toThrow(
      /geolocation must be an object/
    )

    expect(() =>
      createFeatureControl(
        { enabled: true, ready: true, geolocation: false },
        { geolocation: true }
      )
    ).toThrow(/geolocation must be an object/)
  })

  test("doesn't validate disabled modules opts", async () => {
    expect(() =>
      createFeatureControl(
        { enabled: true, ready: false },
        { shutdownSemver: false, geolocation: false, enabledOverride: false }
      )
    ).not.toThrow()
  })
})

describe('createFeatureControl', () => {
  test('can be called with no or empty arguments', async () => {
    const featureControl = createFeatureControl({
      enabled: true,
      ready: false,
    })
    expect(() => featureControl.getIsOn()).not.toThrow()
    expect(() => featureControl.getIsOn({})).not.toThrow()
  })

  test('observes ready', async () => {
    const featureControlNotReady = createFeatureControl({
      enabled: true,
      ready: false,
    })
    expect(featureControlNotReady.getIsOn()).toBe(false)

    const featureControlReady = createFeatureControl({
      enabled: true,
      ready: true,
    })
    expect(featureControlReady.getIsOn()).toBe(true)
  })

  test('observes enabled', async () => {
    const featureControlNotEnabled = createFeatureControl({
      enabled: false,
      ready: true,
    })
    expect(featureControlNotEnabled.getIsOn()).toBe(false)

    const featureControlEnabled = createFeatureControl({
      enabled: true,
      ready: true,
    })
    expect(featureControlEnabled.getIsOn()).toBe(true)
  })

  test('overrides enabled', async () => {
    const featureControlNotOverridable = createFeatureControl({
      enabled: false,
      ready: true,
    })
    expect(featureControlNotOverridable.getIsOn({ enabled: true })).toBe(false)

    const featureControlOverridable = createFeatureControl(
      {
        enabled: false,
        ready: true,
      },
      { enabledOverride: true }
    )
    expect(featureControlOverridable.getIsOn()).toBe(false)
    expect(featureControlOverridable.getIsOn({ enabled: true })).toBe(true)
  })

  test("doesn't override ready", async () => {
    const featureControlNotOverridable = createFeatureControl({
      enabled: true,
      ready: false,
    })
    expect(featureControlNotOverridable.getIsOn({ enabled: true })).toBe(false)

    const featureControlOverridable = createFeatureControl(
      {
        enabled: true,
        ready: false,
      },
      { enabledOverride: true }
    )
    expect(featureControlOverridable.getIsOn()).toBe(false)
    expect(featureControlOverridable.getIsOn({ enabled: true })).toBe(false)
  })

  test('observes shutdown semver', async () => {
    const featureControlNotOverridable = createFeatureControl({
      enabled: true,
      ready: true,
      versionSemver: '2.0.0',
    })
    expect(featureControlNotOverridable.getIsOn({ shutdownSemver: '>1' })).toBe(true)

    const featureControlOverridable = createFeatureControl(
      {
        enabled: true,
        ready: true,
        versionSemver: '2.0.0',
      },
      { shutdownSemver: true }
    )
    expect(featureControlOverridable.getIsOn()).toBe(true)
    expect(featureControlOverridable.getUnavailableReason()).toBe(undefined)
    expect(featureControlOverridable.getIsOn({ shutdownSemver: '>1' })).toBe(false)
    expect(featureControlOverridable.getUnavailableReason({ shutdownSemver: '>1' })).toBe(
      'shutdownSemver'
    )
  })

  test('returns unavailable status', async () => {
    const featureControl = createFeatureControl({
      enabled: true,
      ready: true,
    })
    expect(featureControl.getUnavailableStatus({ error: 'Feature is disabled!' })).toBe(
      'Feature is disabled!'
    )

    const featureControlOverridable = createFeatureControl(
      {
        enabled: true,
        ready: true,
      },
      { enabledOverride: true }
    )
    expect(
      featureControlOverridable.getUnavailableStatus({
        error: 'Feature is disabled!',
        enabled: true,
      })
    ).toBe('Feature is disabled!')

    expect(
      featureControlOverridable.getUnavailableStatus({
        unavailableStatus: 'Feature is disabled!',
        enabled: false,
      })
    ).toBe('Feature is disabled!')
  })

  test('observes geolocation', async () => {
    const featureControl = createFeatureControl(
      {
        enabled: true,
        ready: true,
        geolocation: {
          countryCode: 'US',
          regionCode: 'TX',
        },
      },
      {
        geolocation: true,
      }
    )

    expect(featureControl.getIsOn()).toBe(true)
    expect(featureControl.getIsOn({})).toBe(true)
    expect(featureControl.getIsOn({ geolocation: [] })).toBe(false)
    expect(featureControl.getIsOn({ geolocation: {} })).toBe(false)

    expect(featureControl.getIsOn({ geolocation: { countries: 'all' } })).toBe(true)
    expect(
      featureControl.getIsOn({
        geolocation: {
          countries: 'all',
          disabledCountries: {
            US: 'United States of America',
          },
        },
      })
    ).toBe(false)
    expect(
      featureControl.getIsOn({
        geolocation: {
          countries: {
            US: 'United States of America',
          },
          disabledCountries: {
            US: 'United States of America',
          },
        },
      })
    ).toBe(false)
    expect(
      featureControl.getIsOn({
        geolocation: {
          disabledCountries: {
            US: 'United States of America',
          },
        },
      })
    ).toBe(false)

    expect(
      featureControl.getIsOn({
        geolocation: { countries: { US: 'United States of America' } },
      })
    ).toBe(true)

    expect(
      featureControl.getIsOn({
        geolocation: { countries: { AL: 'Albania' } },
      })
    ).toBe(false)

    expect(
      featureControl.getIsOn({
        geolocation: { countries: 'all', disabledRegions: { US: { TX: 'Texas' } } },
      })
    ).toBe(false)

    expect(
      featureControl.getUnavailableReason({
        geolocation: { countries: 'all', disabledRegions: { US: { NY: 'New York' } } },
      })
    ).toBe(undefined)

    expect(
      featureControl.getIsOn({
        geolocation: { countries: 'all', disabledRegions: { US: { NY: 'New York' } } },
      })
    ).toBe(true)

    expect(
      featureControl.getUnavailableReason({
        geolocation: { countries: 'all', disabledCountries: { US: 'United States of America ' } },
      })
    ).toBe('geolocation')
  })
})

describe('modules interaction', () => {
  const featureControl = createFeatureControl(
    {
      enabled: true,
      ready: true,
      versionSemver: '1.0.0',
      geolocation: {
        countryCode: 'US',
        regionCode: 'TX',
      },
    },
    {
      enabledOverride: true,
      geolocation: true,
      shutdownSemver: true,
    }
  )

  test('no config works with all modules enabled', async () => {
    expect(featureControl.getIsOn()).toBe(true)
  })

  test('shutdownSemver takes precedence over enabled=true', async () => {
    expect(featureControl.getIsOn({ shutdownSemver: '1.x', enabled: true })).toBe(false)
  })

  test('geolocation disabling a country takes precedence over enabled=true', async () => {
    expect(
      featureControl.getIsOn({
        geolocation: { countries: 'all', disabledRegions: { US: { TX: 'Texas' } } },
        enabled: true,
      })
    ).toBe(false)
  })

  test("geolocation allowing country doesn't take precedence over enabled=false", async () => {
    expect(
      featureControl.getIsOn({
        geolocation: { countries: 'all' },
        enabled: false,
      })
    ).toBe(false)
  })

  test("geolocation allowing country doesn't take precedence over shutdownSemver", async () => {
    expect(
      featureControl.getIsOn({
        geolocation: { countries: 'all' },
        shutdownSemver: '1.x',
      })
    ).toBe(false)
  })
})
