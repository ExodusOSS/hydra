import { commonProps, validate } from './mainschema.js'

const assets = ['cbBTC', 'cbETH', 'cbXRP']

for (const event of ['PaySpendCryptoDeposit', 'PaySpendCryptoDelegate']) {
  describe(event, () => {
    const properties = {
      ...commonProps,
      asset: 'cbBTC',
      ...(event === 'PaySpendCryptoDeposit' ? { amount: 0.001, amount_usd: 100 } : {}),
    }

    it.each(assets)('accepts %s', (asset) => {
      const payload = { event, properties: { ...properties, asset } }
      expect(validate(payload)).toEqual(payload)
    })

    it('rejects unsupported assets', () => {
      expect(() => validate({ event, properties: { ...properties, asset: 'USDC' } })).toThrow()
    })

    if (event === 'PaySpendCryptoDeposit') {
      it('requires the asset', () => {
        const { asset: _asset, ...rest } = properties
        expect(() => validate({ event, properties: rest })).toThrow()
      })
    }

    it('rejects unexpected data', () => {
      expect(() => validate({ event, properties: { ...properties, address: 'private' } })).toThrow()
    })
  })
}

describe('PaySpendCryptoDeposit amounts', () => {
  const payload = {
    event: 'PaySpendCryptoDeposit',
    properties: { ...commonProps, asset: 'cbETH', amount: 0.025, amount_usd: 60 },
  }

  it.each(['amount', 'amount_usd'])('requires %s', (property) => {
    const properties: Record<string, unknown> = { ...payload.properties }
    delete properties[property]
    expect(() => validate({ ...payload, properties })).toThrow()
  })

  it.each(['amount', 'amount_usd'])('rejects invalid %s', (property) => {
    for (const value of ['100', -1, null]) {
      expect(() =>
        validate({ ...payload, properties: { ...payload.properties, [property]: value } })
      ).toThrow()
    }
  })
})
