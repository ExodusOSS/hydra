import { createInMemoryAtom } from '@exodus/atoms'
import { mapValues } from '@exodus/basic-utils'
import { UnitType } from '@exodus/currency'
import { asset as ethereumMeta } from '@exodus/ethereum-meta'
import { normalizeTxsJSON } from '@exodus/models'
import createStorage from '@exodus/storage-memory'

import { accountStatesAtomDefinition, txLogsAtomDefinition } from '../../atoms/index.js'
import blockchainMetadataDefinition from '../blockchain-metadata.js'
import blockchainQueryModuleDefinition from '../blockchain-query.js'
import { AccountStates } from './test-utils.js'
import _fixtures from './tx-log-fixtures.cjs'

const bitcoin = {
  name: 'bitcoin',
  currency: UnitType.create({
    satoshis: 0,
    bits: 2,
    BTC: 8,
  }),
  get baseAsset() {
    return bitcoin
  },
  get feeAsset() {
    return bitcoin
  },
  api: { createAccountState: () => AccountStates.bitcoin },
}

const ethereum = {
  ...ethereumMeta,
  get baseAsset() {
    return ethereum
  },
  get feeAsset() {
    return ethereum
  },
  api: {},
}

const assets = { bitcoin, ethereum }

const fixtures = mapValues({ bitcoin: _fixtures.bitcoin, ethereum: _fixtures.ethereum }, (json) =>
  normalizeTxsJSON({ json, assets })
)

describe('BlockchainQuery', () => {
  let blockchainQuery

  beforeAll(async () => {
    const assetsModule = {
      getAsset: (assetName) => assets[assetName],
      getAssets: () => assets,
    }
    const enabledWalletAccountsAtom = createInMemoryAtom({ defaultValue: {} })
    const txLogsAtom = txLogsAtomDefinition.factory()
    const accountStatesAtom = accountStatesAtomDefinition.factory()

    const storage = createStorage()
    const blockchainMetadata = blockchainMetadataDefinition.factory({
      assetsModule,
      storage,
      enabledWalletAccountsAtom,
      txLogsAtom,
      accountStatesAtom,
      logger: { error: jest.fn() },
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
