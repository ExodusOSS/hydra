import { createInMemoryAtom } from '@exodus/atoms'
import { mapValues } from '@exodus/basic-utils'
import { UnitType } from '@exodus/currency'
import { asset as ethereumMeta } from '@exodus/ethereum-meta'
import { normalizeTxsJSON } from '@exodus/models'
import createStorage from '@exodus/storage-memory'

import { blockchainMetadataAtomDefinition } from '../../atoms/index.js'
import type { Asset, AssetsByName, AssetsModule, BlockchainQuery, Logger } from '../../types.js'
import blockchainMetadataDefinition from '../blockchain-metadata.js'
import blockchainQueryModuleDefinition from '../blockchain-query.js'
import { AccountStates } from './test-utils.js'
import _fixtures from './tx-log-fixtures.cjs'

// allow: minimal test stubs — only the fields the query module reads are populated
const bitcoin = {
  name: 'bitcoin',
  currency: UnitType.create({
    satoshis: 0,
    bits: 2,
    BTC: 8,
  }),
  get baseAsset(): Asset {
    return bitcoin as unknown as Asset // allow: test fixture
  },
  get feeAsset(): Asset {
    return bitcoin as unknown as Asset // allow: test fixture
  },
  api: { createAccountState: () => AccountStates.bitcoin },
} as unknown as Asset // allow: test fixture

const ethereum = {
  ...ethereumMeta,
  get baseAsset(): Asset {
    return ethereum as unknown as Asset // allow: test fixture
  },
  get feeAsset(): Asset {
    return ethereum as unknown as Asset // allow: test fixture
  },
  api: {},
} as unknown as Asset // allow: test fixture

const assets: AssetsByName = { bitcoin, ethereum }
const assetsModule: AssetsModule = {
  getAsset: (assetName: string) => assets[assetName]!,
  getAssets: () => assets,
}
const createLogger = (): Logger => ({
  trace: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
})

const fixtures = mapValues(
  { bitcoin: _fixtures.bitcoin ?? [], ethereum: _fixtures.ethereum ?? [] },
  (json) => normalizeTxsJSON({ json: [...json], assets })
)

describe('BlockchainQuery', () => {
  let blockchainQuery: BlockchainQuery

  beforeAll(async () => {
    const enabledWalletAccountsAtom = createInMemoryAtom({ defaultValue: {} })
    const blockchainMetadataAtom = blockchainMetadataAtomDefinition.factory()

    const storage = createStorage()
    const blockchainMetadata = blockchainMetadataDefinition.factory({
      assetsModule,
      storage,
      enabledWalletAccountsAtom,
      blockchainMetadataAtom,
      logger: createLogger(),
      errorTracking: { track: jest.fn() },
    })

    blockchainQuery = blockchainQueryModuleDefinition.factory({
      blockchainMetadata,
    })

    await blockchainMetadata.load()

    await blockchainMetadata.updateTxs({
      assetName: 'bitcoin',
      walletAccount: 'exodus_0',
      txs: fixtures.bitcoin,
    })
    await blockchainMetadata.updateTxs({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
      txs: fixtures.ethereum,
    })
  })

  describe('isUsedRecipientAddress', () => {
    it.each([
      // addresses from tx-log-fixture.json
      { assetName: 'bitcoin', address: '1JXm4NRQLFY1PjvHaDHzbQrcQGge4zSKrS' },
      { assetName: 'bitcoin', address: '3CSeY9MFcug7DV3GQxL3tBEz9oTVRuAKzm' },
      { assetName: 'ethereum', address: '0xa96b536eef496e21f5432fd258b6f78cf3673f74' },
    ])(
      'should return true when provided address was sent currency before',
      async ({ assetName, address }) => {
        const isUsed = await blockchainQuery.isUsedRecipientAddress({
          walletAccount: 'exodus_0',
          assetName,
          address,
        })
        expect(isUsed).toBe(true)
      }
    )

    it.each([
      { assetName: 'bitcoin', address: 'not-an-address' },
      { assetName: 'bitcoin', address: '1FfmbHfnpaZjKFvyi1okTjJJusN455paPH' },
      { assetName: 'ethereum', address: '0xc0ffee254729296a45a3885639AC7E10F9d54979' },
    ])(
      'should return false when provided address was never sent currency before',
      async ({ assetName, address }) => {
        const isUsed = await blockchainQuery.isUsedRecipientAddress({
          walletAccount: 'exodus_0',
          assetName,
          address,
        })
        expect(isUsed).toBe(false)
      }
    )
  })
})
