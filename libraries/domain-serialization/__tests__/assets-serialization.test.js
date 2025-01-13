import {
  assetsApi as _assetsApi,
  deserializeAssets as deserialize,
  serializeAssets as serialize,
} from '../src/assets-serialization.js'
import createAssetsForTesting from './assets-for-testing.js'

const { assets } = createAssetsForTesting()

const { solana } = assets

const solTokens = Object.values(assets).filter(({ assetType }) => assetType === 'SOLANA_TOKEN')

const assetsApi = (assetName, ...args) => _assetsApi(assets[assetName], ...args)

describe('assets-serialization', () => {
  describe('serializes', () => {
    it('base asset', () => {
      const [serialized] = serialize([solana])
      ;['currency', 'baseAsset', 'feeAsset', 'combinedAssets'].forEach((p) =>
        expect(serialized).not.toHaveProperty(p)
      )

      expect(serialized.baseAssetName).toBe(solana.baseAsset.name)
      expect(serialized.feeAssetName).toBe(solana.feeAsset.name)
    })

    it('tokens', () => {
      const serialized = serialize(solTokens)

      serialized.forEach((token) => {
        ;['currency', 'baseAsset', 'feeAsset', 'combinedAssets'].forEach((p) =>
          expect(token).not.toHaveProperty(p)
        )

        expect(token.assetId).toBe(token.mintAddress)
      })
    })
  })

  describe('deserializes', () => {
    it('base asset', () => {
      const serialized = serialize([solana])
      const [deserialized] = deserialize(serialized, {}, assetsApi)
      ;['address', 'currency', 'keys', 'baseAsset', 'feeAsset', 'blockExplorer', 'api'].forEach(
        (p) => expect(deserialized).toHaveProperty(p)
      )

      expect(deserialized.api).toHaveProperty('hasFeature')
      expect(deserialized.api).not.toHaveProperty('assetId')

      expect(deserialized.baseAsset.name).toBe(deserialized.baseAssetName)
      expect(deserialized.feeAsset.name).toBe(deserialized.baseAssetName)
      expect(deserialized.accountReserve.equals(solana.accountReserve)).toBe(true)
    })

    it('tokens', () => {
      const serialized = serialize(solTokens)
      const deserialized = deserialize(serialized, assets, assetsApi)

      deserialized.forEach((token) => {
        ;['address', 'currency', 'keys', 'baseAsset', 'feeAsset', 'blockExplorer', 'api'].forEach(
          (p) => {
            expect(token).toHaveProperty(p)
            expect(token[p]).toBeInstanceOf(Object)
          }
        )

        expect(token.baseAsset).toEqual(assets[token.name].baseAsset)
        expect(token.feeAsset).toEqual(assets[token.name].feeAsset)
        expect(token.accountReserve).toBeUndefined()
      })
    })
  })

  describe('call simple api functions', () => {
    const serialized = serialize([solana])
    const [deserialized] = deserialize(serialized, assets, assetsApi)

    it('hasFeature returns correct results', async () => {
      expect(await deserialized.api.hasFeature('accountState')).toBe(true)
      expect(await deserialized.api.hasFeature('foobar')).toBe(false)
    })

    it('validateAssetId returns correct results', async () => {
      const validAddress = 'CWE8jPTUYhdCTZYWPTe1o5DFqfdjzWKc9WKz6rSjQUdG'
      expect(await deserialized.api.validateAssetId(validAddress)).toBe(true)
      expect(await deserialized.api.validateAssetId('invalidsddress')).toBe(false)
    })
  })

  describe('call less simple api functions', () => {
    const serialized = serialize([solana])
    const [deserialized] = deserialize(serialized, {}, assetsApi)

    it(`getFee returns correct result`, async () => {
      const result = await deserialized.api.getFee({
        feeData: { fee: solana.currency.defaultUnit(0.5) },
      })
      expect(result.toDefaultString({ unit: true })).toBe('0.5 SOL')
    })
  })
})
