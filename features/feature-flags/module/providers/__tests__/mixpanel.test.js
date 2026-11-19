import MixpanelProvider from '../mixpanel.js'

const mockMixpanelResponse = {
  code: 200,
  flags: {
    payIsEnabled: {
      variant_key: 'On',
      variant_value: true,
    },
    disabledFeature: {
      variant_key: 'Off',
      variant_value: false,
    },
  },
  status: 'OK',
}

describe('MixpanelProvider', () => {
  let provider
  let mockTrack
  let originalFetch

  beforeEach(() => {
    originalFetch = global.fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockMixpanelResponse),
    })

    mockTrack = jest.fn()
    provider = new MixpanelProvider({
      apiHost: 'https://flags.example.com',
      analytics: { track: mockTrack },
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  describe('constructor', () => {
    it('should throw if apiHost is missing', () => {
      expect(() => new MixpanelProvider({})).toThrow('Mixpanel provider requires apiHost')
    })
  })

  describe('sync', () => {
    it('should fetch flags with context', async () => {
      await provider.sync({
        userId: 'user-123',
        geolocation: { countryCode: 'US' },
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://flags.example.com/flags?context='),
        { method: 'GET' }
      )

      const url = new URL(global.fetch.mock.calls[0][0])
      const context = JSON.parse(url.searchParams.get('context'))

      expect(context.distinct_id).toBe('user-123')
      expect(context.custom_properties.countryCode).toBe('US')
    })

    it('should throw on API error', async () => {
      global.fetch.mockResolvedValue({ ok: false, status: 500 })
      await expect(provider.sync({})).rejects.toThrow('Mixpanel API error: 500')
    })
  })

  describe('getFeatureFlagNames', () => {
    it('should return empty array before sync', () => {
      expect(provider.getFeatureFlagNames()).toEqual([])
    })

    it('should return flag keys after sync', async () => {
      await provider.sync({})
      expect(provider.getFeatureFlagNames()).toEqual(['payIsEnabled', 'disabledFeature'])
    })
  })

  describe('isEnabled', () => {
    beforeEach(async () => {
      await provider.sync({})
    })

    it('should return true for boolean true variant_value', () => {
      expect(provider.isEnabled('payIsEnabled')).toBe(true)
    })

    it('should return false for boolean false variant_value', () => {
      expect(provider.isEnabled('disabledFeature')).toBe(false)
    })

    it('should return false for unknown flag', () => {
      expect(provider.isEnabled('unknownFlag')).toBe(false)
    })
  })

  describe('getValue', () => {
    beforeEach(async () => {
      await provider.sync({})
    })

    it('should return variant_value', () => {
      expect(provider.getValue('payIsEnabled', null)).toBe(true)
    })

    it('should return default for unknown flag', () => {
      expect(provider.getValue('unknownFlag', 'default')).toBe('default')
    })
  })

  describe('trackExposure', () => {
    beforeEach(async () => {
      await provider.sync({})
    })

    it('should track experiment_started event', async () => {
      await provider.trackExposure('payIsEnabled')

      expect(mockTrack).toHaveBeenCalledWith({
        event: '$experiment_started',
        properties: {
          'Experiment name': 'payIsEnabled',
          'Variant name': 'On',
          $experiment_type: 'feature_flag',
        },
      })
    })

    it('should not track for unknown flag', async () => {
      await provider.trackExposure('unknownFlag')
      expect(mockTrack).not.toHaveBeenCalled()
    })
  })
})
