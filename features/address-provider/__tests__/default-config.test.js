import addressCache from '../address-cache.js'
import addressProvider from '../index.js'

describe('address provider feature defnitions', () => {
  it('should have address-cache defnitions with default flavor', () => {
    const { definitions: addressCacheDefinitions } = addressCache({
      config: { flavor: 'memory' },
    })

    // we are providing no config to use the default config
    const { definitions: addressProviderDefinitions } = addressProvider()
    expect(addressCacheDefinitions.every((def) => addressProviderDefinitions.includes(def))).toBe(
      true
    )
  })

  it('allows choosing synced cache flavor', async () => {
    const { definitions: addressCacheDefinitions } = addressCache({
      config: { flavor: 'synced' },
    })
    const { definitions: addressProviderDefinitions } = addressProvider({
      addressCacheFlavor: 'synced',
    })
    expect(addressCacheDefinitions.every((def) => addressProviderDefinitions.includes(def))).toBe(
      true
    )
  })
})
