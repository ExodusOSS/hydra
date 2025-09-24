import { connectAssets } from '@exodus/assets'
import assetsBase from '@exodus/assets-base'
import { createInMemoryAtom } from '@exodus/atoms'
import { keyBy, mapValues } from '@exodus/basic-utils'
import {
  accountStatesAtomDefinition,
  txLogsAtomDefinition,
} from '@exodus/blockchain-metadata/atoms/index.js'
import blockchainMetadataDefinition from '@exodus/blockchain-metadata/module/index.js'
import { normalizeTxsJSON, OrderSet, PersonalNoteSet, WalletAccount } from '@exodus/models'
import createStorage from '@exodus/storage-memory'
import EventEmitter from 'events/events.js'

import { create as createExportTransactions } from '../index.js'
import { formatTransactionOutput } from '../utils.js'
import loadFixture from './load-fixture.cjs'

const ordersFixtures = loadFixture('orders-fixtures')
const fixtures = loadFixture('tx-log-fixtures')

const assets = connectAssets(assetsBase)

const txFixtures = mapValues(fixtures, (json) => normalizeTxsJSON({ json, assets }))

const getAssetSpecificConstants = (asset) => {
  const constants = {}

  if (asset.name === 'cardano') {
    constants.ADA_KEY_DEPOSIT_FEE = assets[asset.name].currency.defaultUnit('2')
  }

  return constants
}

const { factory: createBlockchainMetadata } = blockchainMetadataDefinition
const createAssetsModule = () =>
  Object.assign(new EventEmitter(), {
    getAssets: () => assets,
    getAsset: (assetName) => {
      return {
        ...assets[assetName],
        ...getAssetSpecificConstants(assets[assetName]),
      }
    },
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

  it('should deduplicate addresses in CSV output', () => {
    const mockTx = {
      date: '2023-01-01',
      from: ['addr1', 'addr1', 'addr2'],
      to: ['addr3', 'addr3', null, 'addr4'],
      txId: 'test-tx-id',
      tokens: [],
    }

    const result = formatTransactionOutput({
      tx: mockTx,
      type: 'withdrawal',
      asset: { blockExplorer: { txUrl: () => 'test-url' } },
      coinAmount: { toDefaultNumber: () => 100 },
      coinCurrency: 'BTC',
      feeAmount: { toDefaultNumber: () => 1, isZero: false },
      feeCurrency: 'BTC',
      walletAccount: 'test-account',
      oppositeWalletAccount: 'other-account',
    })

    expect(result.fromAddress).toBe('addr1 | addr2')
    expect(result.toAddress).toBe('addr3 | addr4')
  })
})
