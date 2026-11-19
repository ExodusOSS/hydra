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

  test('validates rolloutBucket', async () => {
    for (const rolloutBucket of [-1, 100, 1.5, '5']) {
      expect(() =>
        createFeatureControl({ enabled: true, ready: true, rolloutBucket }, { rollout: true })
      ).toThrow(/rolloutBucket must be an integer in \[0, 99]/)
    }

    expect(() =>
      createFeatureControl({ enabled: true, ready: true }, { rollout: true })
    ).not.toThrow()
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
          regionName: 'Texas',
          regionCity: 'Austin',
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
      featureControl.getIsOn({
        geolocation: { countries: 'all', disabledRegions: { US: { Austin: 'Austin' } } },
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

    expect(
      featureControl.getIsOn({
        geolocation: {
          countries: 'all',
          enabledRegions: { US: { TX: 'Texas' } },
        },
      })
    ).toBe(true)

    expect(
      featureControl.getIsOn({
        geolocation: {
          countries: 'all',
          enabledRegions: { US: { Austin: 'Austin' } },
        },
      })
    ).toBe(true)

    expect(
      featureControl.getIsOn({
        geolocation: {
          countries: 'all',
          enabledRegions: { US: { TX: 'Texas' } },
          disabledRegions: { US: { TX: 'Texas' } },
        },
      })
    ).toBe(false)

    expect(
      featureControl.getIsOn({
        geolocation: {
          countries: 'all',
          enabledRegions: { US: { NY: 'New York' } },
        },
      })
    ).toBe(false)

    expect(
      featureControl.getIsOn({
        geolocation: {
          countries: { US: 'United States of America' },
          enabledRegions: { US: { TX: 'Texas' } },
        },
      })
    ).toBe(true)

    const featureControlNoRegionCode = createFeatureControl(
      {
        enabled: true,
        ready: true,
        geolocation: {
          countryCode: 'US',
          regionName: 'Texas',
        },
      },
      {
        geolocation: true,
      }
    )

    expect(
      featureControlNoRegionCode.getIsOn({
        geolocation: { countries: 'all', disabledRegions: { US: { TX: 'Texas' } } },
      })
    ).toBe(false)

    const featureControlBrazil = createFeatureControl(
      {
        enabled: true,
        ready: true,
        geolocation: {
          countryCode: 'BR',
          countryName: 'Brazil',
          regionCode: 'SC',
          regionName: 'Santa Catarina',
        },
      },
      {
        geolocation: true,
      }
    )

    expect(
      featureControlBrazil.getIsOn({
        geolocation: {
          countries: { BR: 'Brazil' },
          enabledRegions: { BR: { SC: 'Santa Catarina' } },
        },
      })
    ).toBe(true)

    expect(
      featureControlBrazil.getIsOn({
        geolocation: {
          countries: { BR: 'Brazil' },
          enabledRegions: { BR: { RJ: 'Rio de Janeiro' } },
        },
      })
    ).toBe(false)
  })

  test('enabledRegions only gates countries listed in it', async () => {
    const featureControlFrance = createFeatureControl(
      {
        enabled: true,
        ready: true,
        geolocation: {
          countryCode: 'FR',
          countryName: 'France',
          regionCode: 'PAC',
          regionName: 'Provence-Alpes-Côte d’Azur',
        },
      },
      { geolocation: true }
    )

    const config = {
      countries: { FR: 'France', US: 'United States of America' },
      enabledRegions: { US: { TX: 'Texas' } },
    }

    expect(featureControlFrance.getIsOn({ geolocation: config })).toBe(true)

    const featureControlUsTexas = createFeatureControl(
      {
        enabled: true,
        ready: true,
        geolocation: { countryCode: 'US', regionCode: 'TX', regionName: 'Texas' },
      },
      { geolocation: true }
    )
    expect(featureControlUsTexas.getIsOn({ geolocation: config })).toBe(true)

    const featureControlUsNewYork = createFeatureControl(
      {
        enabled: true,
        ready: true,
        geolocation: { countryCode: 'US', regionCode: 'NY', regionName: 'New York' },
      },
      { geolocation: true }
    )
    expect(featureControlUsNewYork.getIsOn({ geolocation: config })).toBe(false)

    expect(
      featureControlFrance.getIsOn({
        geolocation: { countries: { FR: 'France' }, enabledRegions: { FR: {} } },
      })
    ).toBe(false)
  })

  test('enabledRegions fails closed when per-country value is not a plain object', async () => {
    const featureControlUsTexas = createFeatureControl(
      {
        enabled: true,
        ready: true,
        geolocation: { countryCode: 'US', regionCode: 'TX', regionName: 'Texas' },
      },
      { geolocation: true }
    )

    for (const invalid of ['all', [], ['TX'], null, 0, true]) {
      expect(
        featureControlUsTexas.getIsOn({
          geolocation: { countries: 'all', enabledRegions: { US: invalid } },
        })
      ).toBe(false)
    }
  })
})

describe('rollout', () => {
  const create = (rolloutBucket) =>
    createFeatureControl({ enabled: true, ready: true, rolloutBucket }, { rollout: true })

  test('is on only for buckets under rollout', async () => {
    expect(create(24).getIsOn({ rollout: 25 })).toBe(true)
    expect(create(25).getIsOn({ rollout: 25 })).toBe(false)
    expect(create(25).getUnavailableReason({ rollout: 25 })).toBe('rollout')
    expect(create(0).getIsOn({ rollout: 0 })).toBe(false)
    expect(create(99).getIsOn({ rollout: 100 })).toBe(true)
  })

  test('does not restrict when remote config has no rollout', async () => {
    expect(create(99).getIsOn()).toBe(true)
    expect(create(99).getIsOn({ rollout: null })).toBe(true)
  })

  test('fails closed when rollout is invalid', async () => {
    for (const rollout of ['25', -1, 101, 12.5, Number.NaN, true, {}]) {
      expect(create(0).getIsOn({ rollout })).toBe(false)
    }
  })

  test('is off without a bucket unless rollout is 100', async () => {
    expect(create().getIsOn({ rollout: 99 })).toBe(false)
    expect(create().getIsOn({ rollout: 100 })).toBe(true)
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

  test("rollout including the user doesn't take precedence over enabled=false", async () => {
    const featureControlWithRollout = createFeatureControl(
      { enabled: true, ready: true, rolloutBucket: 0 },
      { enabledOverride: true, rollout: true }
    )

    expect(featureControlWithRollout.getIsOn({ rollout: 100, enabled: false })).toBe(false)
    expect(featureControlWithRollout.getIsOn({ rollout: 100, enabled: true })).toBe(true)
  })

  test('rollout excluding the user takes precedence over enabled=true', async () => {
    const featureControlWithRollout = createFeatureControl(
      { enabled: false, ready: true, rolloutBucket: 50 },
      { enabledOverride: true, rollout: true }
    )

    expect(featureControlWithRollout.getIsOn({ rollout: 50, enabled: true })).toBe(false)
  })
})
