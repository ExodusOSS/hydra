import { createAtomMock, createInMemoryAtom } from '@exodus/atoms'
import { keyBy } from '@exodus/basic-utils'
import { Address, WalletAccount } from '@exodus/models'
import { NftsProxyApi } from '@exodus/nfts-proxy'
import { enabledWalletAccountsAtomDefinition } from '@exodus/wallet-accounts/atoms'
import ms from 'ms'

import { BATCH_TRANSACTION_LOOKBACK_PERIOD } from '../constants.js'
import nftsMonitorDefinition from '../index.js'

const { LEDGER_SRC, DEFAULT: DEFAULT_WALLET_ACCOUNT } = WalletAccount

const { factory: createEnabledWalletAccountsAtom } = enabledWalletAccountsAtomDefinition

const hardwareWalletAccount = new WalletAccount({
  source: LEDGER_SRC,
  id: 2,
  index: 2,
  label: 'Work',
  color: '#00b4c2',
  icon: 'safe',
  enabled: true,
})

const walletAccountInstances = [DEFAULT_WALLET_ACCOUNT, hardwareWalletAccount]

const walletAccountsData = keyBy(walletAccountInstances, (w) => w.toString())

const advance = (ms) => {
  jest.advanceTimersByTime(ms)
  return new Promise(setImmediate)
}

const addresses = {
  [walletAccountInstances[0].toString()]: {
    ethereum: new Address('ethAddress'),
    solana: new Address('solanaAddress'),
  },
  [hardwareWalletAccount.toString()]: {
    ethereum: new Address('hwAccountEthereumAddress'),
    solana: new Address('hwAccountSolanaAddress'),
  },
}

const baseAssetNamesToMonitorAtomMockValue = ['solana', 'ethereum']

let nftsProxyMock
let txLogsAtomMock
let nftBatchMonitorStatusMock
let fetchMock

const fetch = jest.exodus.mock.fetchReplay()

const prepare = () => {
  const logger = { warn: jest.fn(), error: jest.fn() }

  fetchMock = jest.fn(fetch)

  const addressProviderMock = {
    getReceiveAddress: ({ assetName, walletAccount }) => addresses[walletAccount][assetName],
  }

  const walletAccountsAtom = createInMemoryAtom({ defaultValue: walletAccountsData })

  const nftsAtom = createInMemoryAtom({ defaultValue: {} })

  const nftsTxsAtom = createInMemoryAtom({ defaultValue: {} })

  nftBatchMonitorStatusMock = createInMemoryAtom({ defaultValue: {} })

  const enabledWalletAccountsAtom = createEnabledWalletAccountsAtom({ walletAccountsAtom })

  const baseAssetNamesToMonitorAtom = createAtomMock({
    defaultValue: baseAssetNamesToMonitorAtomMockValue,
  })

  nftsProxyMock = new NftsProxyApi({ baseUrl: '', networs: ['solana', 'ethereum'] })

  txLogsAtomMock = createInMemoryAtom({ defaultValue: {} })

  const assets = {
    ethereum: { name: 'ethereum', api: { hasFeature: (feature) => feature === 'nfts' } },

    solana: { name: 'solana', api: { hasFeature: (feature) => feature === 'nfts' } },
  }

  const nftsConfigAtom = createAtomMock({
    defaultValue: {},
  })

  const assetsModule = { getAsset: (assetName) => assets[assetName] }
  const nftsMonitor = nftsMonitorDefinition.factory({
    addressProvider: addressProviderMock,
    assetsModule,
    enabledWalletAccountsAtom,
    nfts: {},
    nftsAtom,
    nftsTxsAtom,
    nftsConfigAtom,
    txLogsAtom: txLogsAtomMock,
    baseAssetNamesToMonitorAtom,
    nftBatchMonitorStatusAtom: nftBatchMonitorStatusMock,
    nftsProxy: nftsProxyMock,
    logger,
    fetch: fetchMock,
    config: {
      emptyTxsIntervalMultiplier: 4,
      emptyNftsIntervalMultiplier: 2,
      useBatchMonitor: true,
    },
  })

  return {
    nftsAtom,
    nftsTxsAtom,
    nftsMonitor,
  }
}

describe('nfts Batch Monitor', () => {
  test('should start and fetch', async () => {
    const fetchInterval = ms('5m')

    jest.useFakeTimers({ doNotFake: ['setImmediate'] })

    const { nftsTxsAtom, nftsAtom, nftsMonitor } = prepare()

    const verifySolanaTx = async () => {
      const txs = await nftsTxsAtom.get()
      const receivedDataArray = txs[walletAccountInstances[0].toString()].solana || []
      const tx = receivedDataArray[0]
      expect(tx.from).toEqual('solanaAddress')
      expect(tx.network).toEqual('solana')
      expect(tx.txId).toEqual(
        '2fWHpReogcHr957aUPCkjYBFF4NM7TrTLrFHATuMHgGU9fmFqFsXuPsT44Qa4LYqwDdkwB78dayui4jGoq1uzxhM'
      )
      expect(tx.ownerAddress).toEqual('solanaAddress')
    }

    const verifyNewSolanaTx = async () => {
      const txs = await nftsTxsAtom.get()
      const receivedDataArray = txs[walletAccountInstances[0].toString()].solana || []
      const tx = receivedDataArray[1]
      expect(tx.txId).toEqual(
        '3fWHpReogcHr957aUPCkjYBFF4NM7TrTLrFHATuMHgGU9fmFqFsXuPsT44Qa4LYqwDdkwB78dayui4jGoq1uzxhM'
      )
      expect(tx.ownerAddress).toEqual('solanaAddress')
      expect(tx.from).toEqual('solanaAddress')

      // check 2nd wallet account, ownerAddress should match its address
      const secondAccountTx = txs[walletAccountInstances[1].toString()].solana[1]
      expect(secondAccountTx.txId).toEqual(
        '3fWHpReogcHr957aUPCkjYBFF4NM7TrTLrFHATuMHgGU9fmFqFsXuPsT44Qa4LYqwDdkwB78dayui4jGoq1uzxhM'
      )
      expect(secondAccountTx.ownerAddress).toEqual('hwAccountSolanaAddress')
      expect(secondAccountTx.to).toEqual('hwAccountSolanaAddress')
    }

    const verifyNfts = async () => {
      const nfts = await nftsAtom.get()
      const solNftsArray = nfts[walletAccountInstances[0].toString()].solana
      const ethNftsArray = nfts[walletAccountInstances[0].toString()].ethereum

      expect(ethNftsArray.length).toEqual(0)

      expect(solNftsArray.length).toEqual(1)
      expect(solNftsArray[0].mintAddress).toEqual('2hgdjvWQRiVcFb6AVDtsJSM8NadTGkKpcPRYCDpaCQHv')
    }

    jest.setSystemTime(new Date('2020-01-01'))

    nftsMonitor.start()

    await advance(fetchInterval + 50)

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/v2/batch/status'),
      expect.anything()
    )

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/v2/batch/transactions'),
      expect.anything()
    )

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/v2/batch/nfts'),
      expect.anything()
    )

    await verifySolanaTx()

    fetchMock.mockClear()
    await advance(fetchInterval + 50)

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/v2/batch/transactions'),
      expect.anything()
    )

    // No new transactions, shouldn't call nfts
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining('/v2/batch/nfts'),
      expect.anything()
    )

    fetchMock.mockClear()

    await advance(fetchInterval + 50)

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/v2/batch/transactions'),
      expect.anything()
    )

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/v2/batch/nfts'),
      expect.anything()
    )

    await advance(fetchInterval + 50)

    await verifyNewSolanaTx()

    await verifyNfts()

    await nftsMonitor.stop()

    await advance(fetchInterval)
  })

  test('should rewrite tx history on dataVersion change', async () => {
    const fetchInterval = ms('5m')

    jest.useFakeTimers({ doNotFake: ['setImmediate'] })

    const { nftsTxsAtom, nftsMonitor } = prepare()

    await nftBatchMonitorStatusMock.set({
      supportedNetworks: ['solana', 'ethereum'],
      fetchState: {
        solana: {
          solanaAddress: { previousFetch: 1_577_837_100_000 },
          hwAccountSolanaAddress: { previousFetch: 1_577_837_100_000 },
        },
      },
    })

    // initial state, without eventType property for example
    await nftsTxsAtom.set({
      exodus_0: {
        solana: [
          {
            from: 'solanaAddress',
            to: 'solanaAddress2',
            date: 1_712_838_499_000,
            contractAddress: '9aMdfCMdutpJN6ZQ37z55G6TtzonKMNma57xm2ADXMEc',
            tokenId: '9aMdfCMdutpJN6ZQ37z55G6TtzonKMNma57xm2ADXMEc',
            txId: '2fWHpReogcHr957aUPCkjYBFF4NM7TrTLrFHATuMHgGU9fmFqFsXuPsT44Qa4LYqwDdkwB78dayui4jGoq1uzxhM',
            nftId: 'solana:9aMdfCMdutpJN6ZQ37z55G6TtzonKMNma57xm2ADXMEc',
            quantity: 1,
            network: 'solana',
            ownerAddress: 'solanaAddress',
          },
          {
            from: 'solanaAddress',
            to: 'hwAccountSolanaAddress',
            date: 1_712_838_499_100,
            contractAddress: '9aMdfCMdutpJN6ZQ37z55G6TtzonKMNma57xm2ADXMEc',
            tokenId: '9aMdfCMdutpJN6ZQ37z55G6TtzonKMNma57xm2ADXMEc',
            txId: '3fWHpReogcHr957aUPCkjYBFF4NM7TrTLrFHATuMHgGU9fmFqFsXuPsT44Qa4LYqwDdkwB78dayui4jGoq1uzxhM',
            nftId: 'solana:9aMdfCMdutpJN6ZQ37z55G6TtzonKMNma57xm2ADXMEc',
            quantity: 1,
            network: 'solana',
            ownerAddress: 'solanaAddress',
          },
        ],
      },
      ledger_2_2: {
        solana: [
          {
            from: 'hwAccountSolanaAddress',
            to: 'solanaAddress3',
            date: 1_711_454_896_000,
            contractAddress: 'GnAiUdtHEkH7rHDxeiKbwEZk8PP9EwEnd6abMqUBgESk',
            tokenId: 'GnAiUdtHEkH7rHDxeiKbwEZk8PP9EwEnd6abMqUBgESk',
            txId: '8nYKSkqcSnWNyMDytH4GZAVwTTcNNJPuq8wvwn52hvZaVuAfkKMyKiHjyAvjcqziGWYxKwE1yB4oGVU6s7ryBEW',
            nftId: 'solana:GnAiUdtHEkH7rHDxeiKbwEZk8PP9EwEnd6abMqUBgESk',
            quantity: 1,
            network: 'solana',
            ownerAddress: 'hwAccountSolanaAddress',
          },
          {
            from: 'solanaAddress',
            to: 'hwAccountSolanaAddress',
            date: 1_712_838_499_100,
            contractAddress: '9aMdfCMdutpJN6ZQ37z55G6TtzonKMNma57xm2ADXMEc',
            tokenId: '9aMdfCMdutpJN6ZQ37z55G6TtzonKMNma57xm2ADXMEc',
            txId: '3fWHpReogcHr957aUPCkjYBFF4NM7TrTLrFHATuMHgGU9fmFqFsXuPsT44Qa4LYqwDdkwB78dayui4jGoq1uzxhM',
            nftId: 'solana:9aMdfCMdutpJN6ZQ37z55G6TtzonKMNma57xm2ADXMEc',
            quantity: 1,
            network: 'solana',
            ownerAddress: 'hwAccountSolanaAddress',
          },
        ],
      },
    })

    const verifyOldTxs = async () => {
      const txs = await nftsTxsAtom.get()
      const txsArray = txs[walletAccountInstances[0].toString()].solana || []
      expect(txsArray.length).toEqual(2)
      const tx = txsArray[0]
      expect(tx.eventType).toEqual(undefined)
      expect(tx.network).toEqual('solana')
      expect(tx.txId).toEqual(
        '2fWHpReogcHr957aUPCkjYBFF4NM7TrTLrFHATuMHgGU9fmFqFsXuPsT44Qa4LYqwDdkwB78dayui4jGoq1uzxhM'
      )
    }

    const verifyNewSolanaTxs = async () => {
      const txs = await nftsTxsAtom.get()
      const txsArray = txs[walletAccountInstances[0].toString()].solana || []
      expect(txsArray.length).toEqual(2)
      const tx = txsArray[0]
      expect(tx.eventType).not.toEqual(undefined)
      expect(tx.network).toEqual('solana')
      expect(tx.txId).toEqual(
        '2fWHpReogcHr957aUPCkjYBFF4NM7TrTLrFHATuMHgGU9fmFqFsXuPsT44Qa4LYqwDdkwB78dayui4jGoq1uzxhM'
      )
    }

    jest.setSystemTime(new Date('2020-01-01'))

    nftsMonitor.start()

    await verifyOldTxs()

    await advance(fetchInterval + 50)

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/v2/batch/status'),
      expect.anything()
    )

    // contains incremental
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(
        new RegExp(`[&?]fromTimestamp=${1_577_837_100_000 - BATCH_TRANSACTION_LOOKBACK_PERIOD}`)
      ),
      expect.anything()
    )

    // contains request that fetches whole history
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(
        /\/transactions\?networks=solana&addresses=solanaAddress%2ChwAccountSolanaAddress$/
      ),
      expect.anything()
    )

    await verifyNewSolanaTxs()

    fetchMock.mockClear()

    await advance(fetchInterval + 50)

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(
        new RegExp(`[&?]fromTimestamp=${1_577_837_100_050 - BATCH_TRANSACTION_LOOKBACK_PERIOD}`)
      ),
      expect.anything()
    )

    // does not request full history again
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringMatching(
        /\/transactions\?networks=solana&addresses=solanaAddress%2ChwAccountSolanaAddress$/
      ),
      expect.anything()
    )

    fetchMock.mockClear()

    await advance(fetchInterval + 50)

    await nftsMonitor.stop()

    await advance(fetchInterval)
  })

  test('should add, update, and remove recent transactions correctly', async () => {
    const fetchInterval = ms('5m')
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })

    const { nftsTxsAtom, nftsMonitor } = prepare()

    const verifyInitialTxs = async () => {
      const txs = await nftsTxsAtom.get()
      const receivedDataArray = txs[walletAccountInstances[0].toString()].solana || []
      const tx = receivedDataArray[0]
      expect(tx.to).toEqual('solanaAddress')
      expect(tx.network).toEqual('solana')
      expect(tx.someUpdatedProperty).toEqual('oldValue')
      expect(tx.txId).toEqual(
        '2fWHpReogcHr957aUPCkjYBFF4NM7TrTLrFHATuMHgGU9fmFqFsXuPsT44Qa4LYqwDdkwB78dayui4jGoq1uzxhM'
      )
      expect(tx.ownerAddress).toEqual('solanaAddress')
      const toBeRemovedTx = receivedDataArray.find((tx) => tx.txId === 'removedTxId')
      expect(toBeRemovedTx).toBeDefined()

      const toBeAddedLaterTx = receivedDataArray.find(
        (tx) =>
          tx.txId ===
          '1eWHpReogcHr957aUPCkjYBFF4NM7TrTLrFHATuMHgGU9fmFqFsXuPsT44Qa4LYqwDdkwB78dayui4jGoq1uzxhM'
      )
      expect(toBeAddedLaterTx).toBeUndefined()
    }

    const verifyUpdatedTx = async () => {
      const txs = await nftsTxsAtom.get()
      const receivedDataArray = txs[walletAccountInstances[0].toString()].solana || []
      const tx = receivedDataArray.find(
        (tx) =>
          tx.txId ===
          '2fWHpReogcHr957aUPCkjYBFF4NM7TrTLrFHATuMHgGU9fmFqFsXuPsT44Qa4LYqwDdkwB78dayui4jGoq1uzxhM'
      )
      expect(tx).toBeDefined()
      expect(tx.someUpdatedProperty).toEqual('newValue')
    }

    const verifyAddedTx = async () => {
      const txs = await nftsTxsAtom.get()
      const receivedDataArray = txs[walletAccountInstances[0].toString()].solana || []
      const tx = receivedDataArray.find(
        (tx) =>
          tx.txId ===
          '1eWHpReogcHr957aUPCkjYBFF4NM7TrTLrFHATuMHgGU9fmFqFsXuPsT44Qa4LYqwDdkwB78dayui4jGoq1uzxhM'
      )
      expect(tx).toBeDefined()
    }

    const verifyRemovedTx = async () => {
      const txs = await nftsTxsAtom.get()
      const receivedDataArray = txs[walletAccountInstances[0].toString()].solana || []
      const tx = receivedDataArray.find((tx) => tx.txId === 'removedTxId')
      expect(tx).toBeUndefined()
    }

    const verifyNoDuplicates = async () => {
      const txs = await nftsTxsAtom.get()
      const receivedDataArray = txs[walletAccountInstances[0].toString()].solana || []
      const txIds = receivedDataArray.map((tx) => tx.txId)
      const uniqueTxIds = new Set(txIds)
      expect(txIds.length).toEqual(uniqueTxIds.size)
    }

    jest.setSystemTime(new Date('2020-01-01'))
    nftsMonitor.start()

    await advance(fetchInterval + 50)

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/v2/batch/status'),
      expect.anything()
    )
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/v2/batch/transactions'),
      expect.anything()
    )
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/v2/batch/nfts'),
      expect.anything()
    )

    await verifyInitialTxs()

    fetchMock.mockClear()
    await advance(fetchInterval + 50)

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/v2/batch/transactions'),
      expect.anything()
    )

    await verifyUpdatedTx()
    await verifyRemovedTx()
    await verifyNoDuplicates()
    await verifyAddedTx()

    fetchMock.mockClear()

    await advance(fetchInterval + BATCH_TRANSACTION_LOOKBACK_PERIOD + 50)

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/v2/batch/transactions'),
      expect.anything()
    )

    await verifyUpdatedTx()
    await verifyRemovedTx()
    await verifyAddedTx()
    await verifyNoDuplicates()
    await nftsMonitor.stop()

    await advance(fetchInterval)
  })
})
