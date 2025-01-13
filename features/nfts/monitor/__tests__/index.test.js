import { createAtomMock, createInMemoryAtom } from '@exodus/atoms'
import { keyBy } from '@exodus/basic-utils'
import { TxSet, WalletAccount } from '@exodus/models'
import { NftsProxyApi } from '@exodus/nfts-proxy'
import { enabledWalletAccountsAtomDefinition } from '@exodus/wallet-accounts/atoms'
import ms from 'ms'

import nftsMonitorDefinition from '../'
import { MONITOR_SLOW_INTERVAL } from '../constants'

const { TREZOR_SRC, DEFAULT: DEFAULT_WALLET_ACCOUNT } = WalletAccount

const { factory: createEnabledWalletAccountsAtom } = enabledWalletAccountsAtomDefinition

const hardwareWalletAccount = new WalletAccount({
  source: TREZOR_SRC,
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
    ethereum: 'ethAddress',
    solana: 'solanaAddress',
    cardano: 'cardanoAddress',
    bitcoin: ['bitcoinAddress1', 'bitcoinAddress2'],
  },
  [hardwareWalletAccount.toString()]: {
    ethereum: 'hwAccountEthereumAddress',
    solana: 'hwAccountSolanaAddress',
    cardano: 'hwAccountCardanoAddress',
    bitcoin: ['hwBitcoinAddress1', 'hwBitcoinAddress2'],
  },
}

const mockTransactionsResults = {
  solana: [
    {
      nftId: '',
      date: 1,
      from: 'solanaAddress2',
      to: 'solanaAddress',
      txId: 'soltxId1',
    },
  ],
  bitcoin: {
    bitcoinAddress1: [
      {
        nftId: 'someId1',
        date: 1,
        from: 'bitcoinAddress1',
        to: 'anotherbitcoinAddress1',
        txId: 'someNftTx1',
      },
    ],
    bitcoinAddress2: [
      {
        nftId: 'someId2',
        date: 2,
        from: 'bitcoinAddress2',
        to: 'anotherbitcoinAddress2',
        txId: 'someNftTx2',
      },
    ],
  },
}

const mockNftsResults = {
  bitcoin: {
    bitcoinAddress1: [
      {
        id: 'someId1',
        owner: 'owner1',
      },
    ],
    bitcoinAddress2: [
      {
        id: 'someId2',
        owner: 'owner2',
      },
    ],
  },
  solana: {
    solanaAddress: [
      {
        id: 'someId1',
      },
      {
        id: 'someId2',
      },
    ],
  },
}

const baseAssetNamesToMonitorAtomMockValue = ['solana', 'bitcoin']

const withoutOwnerAddress = (arr) =>
  arr.map((item) => {
    const { ownerAddress, ...rest } = item
    return rest
  })

let nftsProxyMock
let txLogsAtomMock

const restoringAssetsAtom = createAtomMock({ defaultValue: {} })

const prepare = () => {
  const logger = { warn: jest.fn(), error: jest.fn() }

  const addressProviderMock = {
    getReceiveAddress: ({ assetName, walletAccount }) => addresses[walletAccount][assetName],
  }

  const walletAccountsAtom = createInMemoryAtom({ defaultValue: walletAccountsData })

  const nftsAtom = createInMemoryAtom({ defaultValue: {} })

  const nftsTxsAtom = createInMemoryAtom({ defaultValue: {} })

  const enabledWalletAccountsAtom = createEnabledWalletAccountsAtom({ walletAccountsAtom })

  const baseAssetNamesToMonitorAtom = createAtomMock({
    defaultValue: baseAssetNamesToMonitorAtomMockValue,
  })

  nftsProxyMock = new NftsProxyApi({ baseUrl: '', networs: ['bitcoin', 'solana'] })

  txLogsAtomMock = createInMemoryAtom({ defaultValue: {} })

  const getNftsAddressesMock = ({ assetName, walletAccount }) => addresses[walletAccount][assetName]

  const assets = {
    bitcoin: {
      name: 'bitcoin',

      api: {
        hasFeature: (feature) => feature === 'nfts',
        nfts: { getNftsAddresses: getNftsAddressesMock },
      },
    },
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
    nftsProxy: nftsProxyMock,
    restoringAssetsAtom,
    logger,
    config: {
      emptyTxsIntervalMultiplier: 4,
      emptyNftsIntervalMultiplier: 2,
    },
  })

  return {
    nftsAtom,
    nftsTxsAtom,
    nftsMonitor,
  }
}

describe('nftsMonitor', () => {
  test('should start and fetch solana NFTs transactions', async () => {
    const fetchInterval = ms('5m')

    jest.useFakeTimers({ doNotFake: ['setImmediate'] })

    const { nftsTxsAtom, nftsMonitor } = prepare()

    const getNftsTransactionsByAddressSpy = jest
      .spyOn(nftsProxyMock.solana, 'getNftsTransactionsByAddress')
      .mockImplementation(async () => mockTransactionsResults.solana)

    const expectReceivedSolanaData = async () => {
      const txs = await nftsTxsAtom.get()
      const receivedDataArray = txs[walletAccountInstances[0].toString()].solana || []
      expect(withoutOwnerAddress(receivedDataArray)).toEqual(mockTransactionsResults.solana)
    }

    nftsMonitor.start()

    await advance(fetchInterval + 50)

    expect(getNftsTransactionsByAddressSpy).not.toHaveBeenCalledWith('hwAccountSolanaAddress')

    await expectReceivedSolanaData()

    await advance(fetchInterval + 50)

    await expectReceivedSolanaData()

    await new Promise(setImmediate)

    await expectReceivedSolanaData()

    await nftsMonitor.stop()

    await advance(fetchInterval)
  })

  test('should update nfts and txs correctly', async () => {
    const fetchInterval = ms('5m')

    jest.useFakeTimers({ doNotFake: ['setImmediate'] })

    const { nftsTxsAtom, nftsAtom, nftsMonitor } = prepare()

    let intervalCounter = 0
    jest
      .spyOn(nftsProxyMock.solana, 'getNftsTransactionsByAddress')
      .mockImplementation(async () => {
        return [
          {
            txId: `soltxId${intervalCounter}`,
            [`prop${intervalCounter}`]: 0,
          },
        ]
      })

    nftsProxyMock.solana.getNftsByOwner = jest.fn((address) => {
      const result =
        intervalCounter === 0
          ? [
              {
                id: `solana:${intervalCounter}`,
                [`prop${intervalCounter}`]: 0,
              },
            ]
          : [
              {
                id: `solana:${intervalCounter}`,
                [`prop${intervalCounter}`]: 0,
              },
              {
                id: `solana:2${intervalCounter}`,
                [`prop${intervalCounter}`]: 0,
              },
            ]
      return Promise.resolve(result)
    })

    nftsMonitor.start()

    await advance(fetchInterval + 50)

    await new Promise(setImmediate)

    intervalCounter = 1

    await advance(fetchInterval + 50)

    await new Promise(setImmediate)

    const nftsData = await nftsAtom.get()
    const nftsTxsData = await nftsTxsAtom.get()

    expect(nftsData.exodus_0.solana.length).toEqual(2)
    expect(nftsData.exodus_0.solana[0].prop0).toBeUndefined()
    expect(nftsData.exodus_0.solana[0].prop1).toEqual(0)
    expect(nftsData.exodus_0.solana[0].id).toEqual(`solana:1`)

    expect(nftsTxsData.exodus_0.solana.length).toEqual(1)
    expect(nftsTxsData.exodus_0.solana[0].prop0).toBeUndefined()
    expect(nftsTxsData.exodus_0.solana[0].prop1).toEqual(0)
    expect(nftsTxsData.exodus_0.solana[0].txId).toEqual(`soltxId1`)

    await nftsMonitor.stop()
  })

  test('should start and fetch bitcoin NFTs', async () => {
    const fetchInterval = ms('5m')

    jest.useFakeTimers({ doNotFake: ['setImmediate'] })

    await restoringAssetsAtom.set({ bitcoin: true })

    const { nftsAtom, nftsTxsAtom, nftsMonitor } = prepare()

    nftsProxyMock.bitcoin = {
      getNftsByOwner: jest.fn((address) => Promise.resolve(mockNftsResults.bitcoin[address])),
      getNftsTransactionsByAddress: jest.fn((address) =>
        Promise.resolve(mockTransactionsResults.bitcoin[address])
      ),
    }

    nftsMonitor.start()

    await advance(fetchInterval + 50)

    // NFT data not loaded yet
    await expect(nftsAtom.get()).resolves.toEqual({})
    await expect(nftsTxsAtom.get()).resolves.toEqual({})

    await restoringAssetsAtom.set({ bitcoin: false })

    await advance(fetchInterval + 50)

    const nfts = await nftsAtom.get()
    const txs = await nftsTxsAtom.get()

    expect(withoutOwnerAddress(nfts[walletAccountInstances[0].toString()].bitcoin)).toEqual(
      Object.values(mockNftsResults.bitcoin).flat()
    )

    expect(withoutOwnerAddress(txs[walletAccountInstances[0].toString()].bitcoin)).toEqual(
      Object.values(mockTransactionsResults.bitcoin).flat()
    )

    await advance(fetchInterval + 50)

    const newNfts = await nftsAtom.get()
    const newTxs = await nftsTxsAtom.get()

    expect(newNfts).toEqual(nfts)
    expect(newTxs).toEqual(txs)

    await nftsMonitor.stop()

    await advance(fetchInterval)
  })

  test('should fallback to cache data if network requests fail', async () => {
    const fetchInterval = ms('5m')

    jest.useFakeTimers({ doNotFake: ['setImmediate'] })

    const { nftsAtom, nftsTxsAtom, nftsMonitor } = prepare()

    const getNftsTransactionsByAddressSpy = jest
      .spyOn(nftsProxyMock.solana, 'getNftsTransactionsByAddress')
      .mockImplementation(async () => mockTransactionsResults.solana)

    nftsProxyMock.solana.getNftsByOwner = jest.fn((address) =>
      Promise.resolve(mockNftsResults.solana[address])
    )

    nftsMonitor.start()

    await expect(nftsAtom.get()).resolves.toEqual({})

    await advance(fetchInterval + 50)

    expect(getNftsTransactionsByAddressSpy).not.toHaveBeenCalledWith('hwAccountSolanaAddress')

    const nfts = await nftsAtom.get()
    const txs = await nftsTxsAtom.get()
    const walletAccountName = walletAccountInstances[0].toString()

    // nfts and txs correctly loaded
    expect(withoutOwnerAddress(txs[walletAccountName].solana)).toEqual(
      mockTransactionsResults.solana
    )

    expect(withoutOwnerAddress(nfts[walletAccountName].solana)).toEqual(
      mockNftsResults.solana[addresses[walletAccountName].solana]
    )

    nftsProxyMock.solana = {
      getNftsByOwner: jest.fn(() => Promise.reject(new Error('Network error'))),
      getNftsTransactionsByAddress: jest.fn(() => Promise.reject(new Error('Network error'))),
    }

    await advance(fetchInterval + 50)

    const newNfts = await nftsAtom.get()
    const newTxs = await nftsTxsAtom.get()

    // solana data remains the same
    expect(newNfts[walletAccountName].solana).toEqual(nfts[walletAccountName].solana)
    expect(newTxs[walletAccountName].solana).toEqual(txs[walletAccountName].solana)

    await nftsMonitor.stop()
  })

  test('should forceUpdate after txLog changes', async () => {
    const minInterval = ms('15s')

    jest.useFakeTimers({ doNotFake: ['setImmediate'] })

    const { nftsMonitor } = prepare()

    const getSolanaNftsByOwnerAddressSpy = jest
      .spyOn(nftsProxyMock.solana, 'getNftsByOwner')
      .mockImplementation(async () => mockTransactionsResults.solana)

    const getBitcoinNftsByOwnerAddressSpy = jest
      .spyOn(nftsProxyMock.bitcoin, 'getNftsByOwner')
      .mockImplementation(async () => mockTransactionsResults.bitcoin)

    nftsMonitor.start()

    await advance(minInterval + 50)

    const expectedBitcoinGetNftsCalls = addresses[DEFAULT_WALLET_ACCOUNT].bitcoin.length

    expect(getSolanaNftsByOwnerAddressSpy).toHaveBeenCalledTimes(1)
    expect(getBitcoinNftsByOwnerAddressSpy).toHaveBeenCalledTimes(expectedBitcoinGetNftsCalls)

    await txLogsAtomMock.set({
      changes: {
        [DEFAULT_WALLET_ACCOUNT]: {
          solana: TxSet.EMPTY,
        },
      },
    })

    await advance(minInterval + 50)

    expect(getSolanaNftsByOwnerAddressSpy).toHaveBeenCalledTimes(2)
    expect(getBitcoinNftsByOwnerAddressSpy).toHaveBeenCalledTimes(expectedBitcoinGetNftsCalls)

    await nftsMonitor.stop()
  })

  test('should have slower interval for empty addresses', async () => {
    const fetchInterval = MONITOR_SLOW_INTERVAL

    jest.useFakeTimers({ doNotFake: ['setImmediate'] })

    const { nftsMonitor } = prepare()

    const getSolanaNftsByOwnerAddressSpy = jest
      .spyOn(nftsProxyMock.solana, 'getNftsByOwner')
      .mockImplementation(async () => [])

    jest
      .spyOn(nftsProxyMock.bitcoin, 'getNftsByOwner')
      .mockImplementation(async () => mockTransactionsResults.bitcoin)

    nftsMonitor.start()

    await advance(fetchInterval)

    expect(getSolanaNftsByOwnerAddressSpy).toHaveBeenCalledTimes(1)

    await advance(fetchInterval)

    expect(getSolanaNftsByOwnerAddressSpy).toHaveBeenCalledTimes(1)

    await new Promise(setImmediate)

    await advance(fetchInterval * 2)

    expect(getSolanaNftsByOwnerAddressSpy).toHaveBeenCalledTimes(2)

    await advance(fetchInterval)

    expect(getSolanaNftsByOwnerAddressSpy).toHaveBeenCalledTimes(2)

    await nftsMonitor.stop()
  })
})
