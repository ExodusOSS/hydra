import featureFactory from '../index.js'

describe('config', () => {
  test('defaults to prod', () => {
    const def = featureFactory()
    expect(def.definitions.find((d) => d.definition.id === 'pricingServerUrlAtom').config).toEqual({
      defaultPricingServerUrl: 'https://pricing.a.exodus.io',
      pricingServerPath: 'infrastructure.price-server.server',
    })
  })

  test('sandbox', () => {
    const def = featureFactory({ sandbox: true })
    expect(def.definitions.find((d) => d.definition.id === 'pricingServerUrlAtom').config).toEqual({
      defaultPricingServerUrl: 'https://pricing-s.a.exodus.io',
      pricingServerPath: 'infrastructure.price-server.server',
    })
  })

  test('overrides', () => {
    const def = featureFactory({
      sandbox: true,
      defaultPricingServerUrl: 'https://example.com',
      pricingServerPath: 'some.path',
    })

    expect(def.definitions.find((d) => d.definition.id === 'pricingServerUrlAtom').config).toEqual({
      defaultPricingServerUrl: 'https://example.com',
      pricingServerPath: 'some.path',
    })
  })
})
