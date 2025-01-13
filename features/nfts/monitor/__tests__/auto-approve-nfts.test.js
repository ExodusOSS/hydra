import { createAtomMock, createInMemoryAtom } from '@exodus/atoms'
import { keyBy } from '@exodus/basic-utils'
import { WalletAccount } from '@exodus/models'
import { NftsProxyApi } from '@exodus/nfts-proxy'
import { enabledWalletAccountsAtomDefinition } from '@exodus/wallet-accounts/atoms'
import ms from 'ms'

import nftsMonitorDefinition from '../index.js'

const { TREZOR_SRC, DEFAULT: DEFAULT_WALLET_ACCOUNT, EXODUS_SRC } = WalletAccount

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

const walletAccount2 = new WalletAccount({
  source: EXODUS_SRC,
  index: 1,
})

const walletAccountInstances = [DEFAULT_WALLET_ACCOUNT, walletAccount2, hardwareWalletAccount]

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
  [walletAccount2]: {
    ethereum: 'ethAddress2',
    solana: 'solanaAddress2',
    cardano: 'cardanoAddress2',
    bitcoin: ['bitcoinAddress3', 'bitcoinAddress4'],
  },
  [hardwareWalletAccount.toString()]: {
    ethereum: 'hwAccountEthereumAddress',
    solana: 'hwAccountSolanaAddress',
    cardano: 'hwAccountCardanoAddress',
    bitcoin: ['hwBitcoinAddress1', 'hwBitcoinAddress2'],
  },
}

const baseAssetNamesToMonitorAtomMockValue = ['solana', 'bitcoin']

let nftsProxyMock
let nftsModule

const nftsConfigAtomMock = createAtomMock({ defaultValue: {} })

const restoringAssetsAtom = createAtomMock({ defaultValue: {} })

const prepare = ({ config = {} } = {}) => {
  const logger = { warn: jest.fn(), debug: jest.fn(), error: jest.fn() }

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

  const assetsModule = { getAsset: (assetName) => assets[assetName] }

  nftsModule = {
    load: jest.fn(),
    upsertConfigs: jest.fn(),
  }

  const txLogsAtom = createInMemoryAtom({ defaultValue: {} })

  const nftsMonitor = nftsMonitorDefinition.factory({
    addressProvider: addressProviderMock,
    assetsModule,
    enabledWalletAccountsAtom,
    nftsAtom,
    nftsTxsAtom,
    txLogsAtom,
    nfts: nftsModule,
    baseAssetNamesToMonitorAtom,
    nftsProxy: nftsProxyMock,
    nftsConfigAtom: nftsConfigAtomMock,
    restoringAssetsAtom,
    logger,
    config,
  })

  return {
    nftsMonitor,
  }
}

describe('nftsMonitor autoApprove Nfts', () => {
  test('should autoApprove Nfts', async () => {
    const fetchInterval = ms('5m')

    jest.useFakeTimers({ doNotFake: ['setImmediate'] })

    const { nftsMonitor } = prepare({ config: { autoApproveOnImport: true } })

    let resolveDelayedAddress
    const delayedAddressPromise = new Promise((resolve) => {
      resolveDelayedAddress = resolve
    })

    nftsProxyMock.solana.getNftsByOwner = jest.fn(async (address) => {
      if (address === 'solanaAddress') {
        return [{ id: 'nftId1' }, { id: 'nftId2' }]
      }

      if (address === 'solanaAddress2') {
        await delayedAddressPromise
        return [{ id: 'nftId3' }]
      }
    })

    nftsProxyMock.bitcoin.getNftsByOwner = jest.fn(async (address) => {
      if (address === 'bitcoinAddress1') {
        return [{ id: 'nftId4' }]
      }

      if (address === 'bitcoinAddress2') {
        return [{ id: 'nftId5' }]
      }
    })

    const previousNftConfigs = {
      nftId1: {
        hidden: false,
      },
      nftId2: {
        hidden: true,
      },
      nftId3: {
        customPrice: 2,
      },
    }

    await nftsConfigAtomMock.set(previousNftConfigs)

    await nftsMonitor.handleNftsOnImport()

    const expectedArray = [
      { customPrice: 2, hidden: false, id: 'nftId3', preImport: true },
      { hidden: false, id: 'nftId4', preImport: true },
      { hidden: false, id: 'nftId5', preImport: true },
    ]

    await nftsMonitor.start()

    await advance(fetchInterval + 50)

    resolveDelayedAddress()

    await advance(0)

    const upsertConfigs = nftsModule.upsertConfigs.mock.calls.flat(1).flat()

    expect(upsertConfigs).toEqual(expect.arrayContaining(expectedArray))
  })

  test('should upsert configs only when needed, autoApproveOnImport:false', async () => {
    const fetchInterval = ms('5m')

    jest.useFakeTimers({ doNotFake: ['setImmediate'] })

    const { nftsMonitor } = prepare({ config: { autoApproveOnImport: false } })

    let resolveDelayedAddress
    const delayedAddressPromise = new Promise((resolve) => {
      resolveDelayedAddress = resolve
    })

    nftsProxyMock.solana.getNftsByOwner = jest.fn(async (address) => {
      if (address === 'solanaAddress') {
        return [{ id: 'nftId1' }, { id: 'nftId2' }]
      }

      if (address === 'solanaAddress2') {
        await delayedAddressPromise
        return [{ id: 'nftId3' }]
      }
    })

    nftsProxyMock.bitcoin.getNftsByOwner = jest.fn(async (address) => {
      if (address === 'bitcoinAddress1') {
        return [{ id: 'nftId4' }]
      }

      if (address === 'bitcoinAddress2') {
        return [{ id: 'nftId5' }]
      }
    })

    const previousNftConfigs = {
      nftId1: {
        preImport: true, // previously imported
      },
      nftId2: {
        hidden: true, // old import, no preImport
      },
      nftId3: {
        customPrice: 2, // old import, no preImport
      },
    }

    await nftsConfigAtomMock.set(previousNftConfigs)

    await nftsMonitor.handleNftsOnImport()

    const expectedArray = [
      { id: 'nftId2', hidden: true, preImport: true },
      { customPrice: 2, id: 'nftId3', preImport: true },
      { id: 'nftId4', preImport: true },
      { id: 'nftId5', preImport: true },
    ]

    await nftsMonitor.start()

    await advance(fetchInterval + 50)

    resolveDelayedAddress()

    await advance(0)

    const upsertConfigs = nftsModule.upsertConfigs.mock.calls.flat(1).flat()

    expect(upsertConfigs).toEqual(expect.arrayContaining(expectedArray))
  })
})
