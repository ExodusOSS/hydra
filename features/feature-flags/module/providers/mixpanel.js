class MixpanelProvider {
  name = 'mixpanel'

  #apiHost
  #analytics
  #cachedFlags = null

  constructor({ apiHost, analytics }) {
    if (!apiHost) {
      throw new Error('Mixpanel provider requires apiHost')
    }

    this.#apiHost = apiHost
    this.#analytics = analytics
  }

  async sync(attributes = {}) {
    const { userId, geolocation = {}, ...platformMetadata } = attributes

    const context = {
      distinct_id: userId || 'anonymous',
      custom_properties: {
        ...platformMetadata,
        countryCode: geolocation.countryCode,
        countryName: geolocation.countryName ?? geolocation.country,
        regionCode: geolocation.regionCode,
        regionName: geolocation.regionName ?? geolocation.region,
        regionCity: geolocation.regionCity,
      },
    }

    const url = new URL('/flags', this.#apiHost)
    url.searchParams.set('context', JSON.stringify(context))

    const response = await fetch(url.toString(), {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error(`Mixpanel API error: ${response.status}`)
    }

    const data = await response.json()
    this.#cachedFlags = data.flags || {}
    return this.#cachedFlags
  }

  isEnabled(key) {
    const flag = this.#cachedFlags?.[key]
    return flag?.variant_value === true
  }

  getValue(key, defaultValue) {
    const flag = this.#cachedFlags?.[key]
    return flag?.variant_value ?? defaultValue
  }

  getFeatureFlagNames() {
    return Object.keys(this.#cachedFlags || {})
  }

  async trackExposure(key) {
    const flag = this.#cachedFlags?.[key]
    if (!flag) return

    return this.#analytics?.track({
      event: '$experiment_started',
      properties: {
        'Experiment name': key,
        'Variant name': flag.variant_key,
        $experiment_type: 'feature_flag',
      },
    })
  }
}

export default MixpanelProvider
