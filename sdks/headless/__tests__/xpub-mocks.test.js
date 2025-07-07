jest.doMock('@exodus/address-provider', () => jest.fn().mockReturnValue({ definitions: [] }))
const mockAddressProvider = jest.requireMock('@exodus/address-provider')

const { default: createAdapters } = await import('./adapters/index.js')
const { default: _config } = await import('./config.js')
const { default: createExodus } = await import('./exodus.js')

const xpubs = {
  exodus_0: {
    bitcoin: {
      44: 'xpub6...',
      84: 'xpub6...',
      86: 'xpub6...',
    },
  },
}

const baseConfig = {
  ..._config,
  addressProvider: {
    debug: false,
    addressCacheFlavor: 'synced',
  },
  publicKeyProvider: {
    debug: true,
    xpubs,
  },
}

describe('overriding address cache when mocking xpubs', () => {
  let adapters
  beforeEach(() => {
    adapters = createAdapters()
  })

  it('DONT disable address cache when xpubs are empty', () => {
    const config = { ...baseConfig, publicKeyProvider: { debug: true, xpubs: {} } }
    expect(() => createExodus({ adapters, config })).not.toThrow()
    expect(mockAddressProvider).toHaveBeenCalledWith(baseConfig.addressProvider)
  })

  it('DONT disable address cache when xpubs are nullish', () => {
    const config = { ...baseConfig, publicKeyProvider: { debug: true, xpubs: undefined } }
    expect(() => createExodus({ adapters, config })).not.toThrow()
    expect(mockAddressProvider).toHaveBeenCalledWith(baseConfig.addressProvider)
  })

  it('DONT disable address cache when not debugging', () => {
    const config = { ...baseConfig, publicKeyProvider: { debug: false, xpubs } }
    expect(() => createExodus({ adapters, config })).not.toThrow()
    expect(mockAddressProvider).toHaveBeenCalledWith(baseConfig.addressProvider)
  })

  it('disables address cache when effectively mocking xpubs', () => {
    expect(() => createExodus({ adapters, config: baseConfig })).not.toThrow()
    expect(mockAddressProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        addressCacheFlavor: 'disabled',
      })
    )
  })
})
