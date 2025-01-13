import createStorage from '@exodus/storage-memory'
import blockchainMetadataDefinition from '@exodus/blockchain-metadata/module'
import EventEmitter from 'events/'
import { connectAssets } from '@exodus/assets'
import assetsBase from '@exodus/assets-base'
import { OrderSet, PersonalNoteSet, WalletAccount, normalizeTxsJSON } from '@exodus/models'
import { keyBy, mapValues } from '@exodus/basic-utils'
import { createInMemoryAtom } from '@exodus/atoms'
import fixtures from './tx-log-fixtures.json'
import ordersFixtures from './orders-fixtures.json'
import { create as createExportTransactions } from '..'
import {
  accountStatesAtomDefinition,
  txLogsAtomDefinition,
} from '@exodus/blockchain-metadata/atoms'

const assets = connectAssets(assetsBase)

const txFixtures = mapValues(fixtures, (json) => normalizeTxsJSON({ json, assets }))

const { factory: createBlockchainMetadata } = blockchainMetadataDefinition

const createAssetsModule = () =>
  Object.assign(new EventEmitter(), {
    getAssets: () => assets,
    getAsset: (assetName) => assets[assetName],
  })

const personalNoteMessage = 'test'
const personalNotesAtomMock = {
  get: async () =>
    PersonalNoteSet.fromArray([{ txId: txFixtures.solana[0].txId, message: personalNoteMessage }]),
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
  let exportTransactions
  let ordersAtom
  let multipleWalletAccountsEnabledAtom
  let txLogsAtom
  let accountStatesAtom

  beforeEach(async () => {
    const storage = createStorage()
    assetsModule = createAssetsModule()

    enabledWalletAccountsAtom = createInMemoryAtom({
      defaultValue: walletAccountsData,
    })

    ordersAtom = {
      get: async () => OrderSet.fromArray(ordersFixtures),
    }

    multipleWalletAccountsEnabledAtom = createInMemoryAtom({
      defaultValue: true,
    })

    txLogsAtom = txLogsAtomDefinition.factory()
    accountStatesAtom = accountStatesAtomDefinition.factory()

    blockchainMetadata = createBlockchainMetadata({
      assetsModule,
      enabledWalletAccountsAtom,
      storage: storage.namespace('blockchain-metadata'),
      txLogsAtom,
      accountStatesAtom,
    })
    blockchainMetadata.load()

    exportTransactions = createExportTransactions({
      blockchainMetadata,
      assetsModule,
      personalNotesAtom: personalNotesAtomMock,
      enabledWalletAccountsAtom,
      multipleWalletAccountsEnabledAtom,
      ordersAtom,
    })

    await blockchainMetadata
      .batch()
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
