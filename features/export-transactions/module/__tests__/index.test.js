import { connectAssets } from '@exodus/assets'
import assetsBase from '@exodus/assets-base'
import { createInMemoryAtom } from '@exodus/atoms'
import { keyBy, mapValues } from '@exodus/basic-utils'
import { blockchainMetadataAtomDefinition } from '@exodus/blockchain-metadata/atoms/index.js'
import blockchainMetadataDefinition from '@exodus/blockchain-metadata/module/index.js'
import { normalizeTxsJSON, OrderSet, PersonalNoteSet, WalletAccount } from '@exodus/models'
import createStorage from '@exodus/storage-memory'
import EventEmitter from 'events/events.js'

import { create as createExportTransactions } from '../index.js'
import loadFixture from './load-fixture.cjs'

const ordersFixtures = loadFixture('orders-fixtures')
const fixtures = loadFixture('tx-log-fixtures')

const addAssetSpecificConstants = (asset) => {
  if (asset.name === 'cardano') {
    asset = { ...asset, ADA_KEY_DEPOSIT_FEE: asset.currency.defaultUnit('2') }
  }

  return asset
}

const assets = mapValues(connectAssets(assetsBase), addAssetSpecificConstants)

const txFixtures = mapValues(fixtures, (json) => normalizeTxsJSON({ json, assets }))

const { factory: createBlockchainMetadata } = blockchainMetadataDefinition
const createAssetsModule = () =>
  Object.assign(new EventEmitter(), {
    getAssets: () => assets,
    getAsset: (assetName) => assets[assetName],
  })

const personalNotesAtomMock = {
  get: async () =>
    PersonalNoteSet.fromArray([
      { txId: txFixtures.solana[0].txId, message: 'test' },
      {
        txId: txFixtures.bitcoin[0].txId,
        message: '',
        sends: { [txFixtures.bitcoin[0].data.sent[0].address]: { message: 'foobar' } },
      },
      {
        txId: txFixtures.bitcoin[2].txId,
        message: '',
        sends: {
          [txFixtures.bitcoin[2].data.sent[0].address]: { message: 'one' },
          [txFixtures.bitcoin[2].data.sent[1].address]: { message: 'two' },
        },
      },
    ]),
}

describe('export-transactions', () => {
  const walletAccountInstances = [
    WalletAccount.DEFAULT,
    new WalletAccount({ source: 'exodus', index: 1 }),
  ]

  const walletAccountsData = keyBy(walletAccountInstances, (w) => w.toString())

  let enabledWalletAccountsAtom
  let blockchainMetadata
  let assetsModule
  let assetsAtom
  let exportTransactions
  let ordersAtom
  let multipleWalletAccountsEnabledAtom
  let blockchainMetadataAtom

  beforeEach(async () => {
    const storage = createStorage()
    assetsModule = createAssetsModule()

    assetsAtom = createInMemoryAtom({ defaultValue: { value: assets } })

    enabledWalletAccountsAtom = createInMemoryAtom({
      defaultValue: walletAccountsData,
    })

    ordersAtom = {
      get: async () => OrderSet.fromArray(ordersFixtures),
    }

    multipleWalletAccountsEnabledAtom = createInMemoryAtom({
      defaultValue: true,
    })

    blockchainMetadataAtom = blockchainMetadataAtomDefinition.factory()

    blockchainMetadata = createBlockchainMetadata({
      assetsModule,
      enabledWalletAccountsAtom,
      storage: storage.namespace('blockchain-metadata'),
      blockchainMetadataAtom,
    })
    blockchainMetadata.load()

    exportTransactions = createExportTransactions({
      blockchainMetadata,
      assetsAtom,
      personalNotesAtom: personalNotesAtomMock,
      enabledWalletAccountsAtom,
      multipleWalletAccountsEnabledAtom,
      ordersAtom,
    })

    await blockchainMetadata
      .batch()
      .updateTxs({
        assetName: 'cardano',
        walletAccount: 'exodus_0',
        txs: txFixtures.cardano,
      })
      .updateTxs({
        assetName: 'serum',
        walletAccount: 'exodus_0',
        txs: txFixtures.serum,
      })
      .updateTxs({
        assetName: 'solana',
        walletAccount: 'exodus_0',
        txs: txFixtures.solana,
      })
      .updateTxs({
        assetName: 'raydium',
        walletAccount: 'exodus_0',
        txs: txFixtures.raydium,
      })
      .updateTxs({
        assetName: 'solana',
        walletAccount: 'exodus_1',
        txs: txFixtures.solana2,
      })
      .updateTxs({
        assetName: 'usdcoin_solana',
        walletAccount: 'exodus_0',
        txs: txFixtures.usdcoin_solana,
      })
      .updateTxs({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        txs: txFixtures.bitcoin,
      })
      .commit()
  })

  it('should export and match snapshot', async () => {
    const exportedTxs = await exportTransactions.exportForWalletAccount(
      WalletAccount.DEFAULT.toString()
    )
    expect(exportedTxs).toMatchSnapshot()
  })

  it('should export with personal notes', async () => {
    const exportedTxs = await exportTransactions.exportForWalletAccount(
      WalletAccount.DEFAULT.toString()
    )
    const txWithPersonalNote = exportedTxs.find((tx) => tx.txId === txFixtures.solana[0].txId)

    const personalNotes = await personalNotesAtomMock.get()
    const expectedPersonalNote = personalNotes.get(txFixtures.solana[0].txId).getMessage()
    expect(txWithPersonalNote.personalNote).toMatch(expectedPersonalNote)
  })

  it('should export with order data', async () => {
    const exportedTxs = await exportTransactions.exportForWalletAccount(
      WalletAccount.DEFAULT.toString()
    )

    ordersFixtures.forEach((orderFixture) => {
      const exportedTx = exportedTxs.find((tx) => tx.orderId === orderFixture.orderId)
      expect(exportedTx).toBeDefined()
      expect(exportedTx.type).toEqual('exchange')
    })
  })
})
