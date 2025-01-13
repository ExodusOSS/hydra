import { createInMemoryAtom } from '@exodus/atoms'
import { asset as bitcoin } from '@exodus/bitcoin-meta'
import { createAsset as createBitcoin } from '@exodus/bitcoin-plugin'
import {
  accountStatesAtomDefinition,
  txLogsAtomDefinition,
} from '@exodus/blockchain-metadata/atoms/index.js'
import blockchainMetadataDefinition from '@exodus/blockchain-metadata/module/index.js'
import { asset as dogecoin } from '@exodus/dogecoin-meta'
import { createAsset as createDoge } from '@exodus/dogecoin-plugin'
import KeyIdentifier from '@exodus/key-identifier'
import { Address, WalletAccount } from '@exodus/models'
import createInMemoryStorage from '@exodus/storage-memory'

import knownAddressesDefinition from '../../module/known-addresses.js'

const { factory: createKnownAddresses } = knownAddressesDefinition
const { factory: createBlockchainMetadata } = blockchainMetadataDefinition
const assetClientInterface = { createLogger: () => console }

describe('KnownAddresses', () => {
  const assetName = 'bitcoin'
  const walletAccount = WalletAccount.DEFAULT
  const otherWalletAccount = new WalletAccount({ ...WalletAccount.DEFAULT, index: 1 })
  const multisigWalletAccount = new WalletAccount({ ...WalletAccount.DEFAULT, isMultisig: true })

  const transactions = {
    bitcoin: [
      {
        coinName: assetName,
        coinAmount: '0.00184082 BTC',
        txId: '1',
        addresses: [
          {
            address: 'a',
            meta: { path: 'm/0/0', purpose: 44 },
          },
          {
            address: 'b',
            meta: { path: 'm/0/1', purpose: 44 },
          },
        ],
        data: {
          changeAddress: {
            address: 'change-1',

            meta: { path: 'm/1/0', purpose: 44 },
          },
        },
        currencies: { bitcoin: bitcoin.currency },
      },
    ],
    dogecoin: [
      {
        coinName: 'dogecoin',
        coinAmount: '0.00184082 DOGE',
        txId: 'doge-1',
        addresses: [
          {
            address: 'doge-mode-on',
            meta: { path: 'm/0/0', purpose: 44 },
          },
        ],
        currencies: { dogecoin: dogecoin.currency },
      },
    ],
  }

  let blockchainMetadata
  let txLogsAtom
  let assetsModule
  let knownAddresses

  beforeEach(async () => {
    const bitcoin = createBitcoin({ assetClientInterface })
    const dogecoin = createDoge({ assetClientInterface })

    const assets = {
      bitcoin: { ...bitcoin, baseAsset: bitcoin, feeAsset: bitcoin },
      dogecoin: { ...dogecoin, baseAsset: dogecoin, feeAsset: dogecoin },
    }

    assetsModule = {
      getAsset: (name) => assets[name],
      getAssets: () => assets,
    }
    txLogsAtom = txLogsAtomDefinition.factory()

    blockchainMetadata = createBlockchainMetadata({
      storage: createInMemoryStorage(),
      assetsModule,
      enabledWalletAccountsAtom: createInMemoryAtom({
        defaultValue: {
          [walletAccount]: walletAccount,
        },
      }),
      logger: console,
      txLogsAtom,
      accountStatesAtom: accountStatesAtomDefinition.factory(),
    })

    await blockchainMetadata.load()
    await blockchainMetadata.updateTxs({
      assetName,
      walletAccount,
      txs: transactions.bitcoin,
    })

    await blockchainMetadata.updateTxs({
      assetName,
      walletAccount: multisigWalletAccount,
      txs: transactions.bitcoin,
    })

    await blockchainMetadata.updateTxs({
      assetName: 'dogecoin',
      walletAccount,
      txs: transactions.dogecoin,
    })

    await blockchainMetadata.updateTxs({
      assetName: 'dogecoin',
      walletAccount: otherWalletAccount,
      txs: [{ ...transactions.dogecoin[0], id: 'doge-second-wallet-account' }],
    })

    knownAddresses = createKnownAddresses({ txLogsAtom, assetsModule })
    knownAddresses.start()
  })

  const transaction = transactions.bitcoin[0]
  const expectedAddresses = [
    {
      address: new Address(transaction.addresses[0].address, {
        path: 'm/0/0',
        purpose: 44,
        walletAccount: walletAccount.toString(),
        keyIdentifier: new KeyIdentifier({
          assetName: 'bitcoin',
          derivationAlgorithm: 'BIP32',
          derivationPath: "m/44'/0'/0'/0/0",
          keyType: 'secp256k1',
        }),
      }),
      addressIndex: 0,
      chainIndex: 0,
      purpose: 44,
    },
    {
      address: new Address(transaction.addresses[1].address, {
        path: 'm/0/1',
        purpose: 44,
        walletAccount: walletAccount.toString(),
        keyIdentifier: new KeyIdentifier({
          assetName: 'bitcoin',
          derivationAlgorithm: 'BIP32',
          derivationPath: "m/44'/0'/0'/0/1",
          keyType: 'secp256k1',
        }),
      }),
      addressIndex: 1,
      chainIndex: 0,
      purpose: 44,
    },
    {
      address: new Address(transaction.data.changeAddress.address, {
        path: 'm/1/0',
        purpose: 44,
        walletAccount: walletAccount.toString(),
        keyIdentifier: new KeyIdentifier({
          assetName: 'bitcoin',
          derivationAlgorithm: 'BIP32',
          derivationPath: "m/44'/0'/0'/1/0",
          keyType: 'secp256k1',
        }),
      }),
      addressIndex: 0,
      chainIndex: 1,
      purpose: 44,
    },
  ]

  it('should retrieve addresses from cache', async () => {
    const addresses = await knownAddresses.get({
      walletAccount,
      assetName,
    })

    expect(addresses).toEqual(expectedAddresses)

    jest.spyOn(txLogsAtom, 'get')

    const addressesFromCache = await knownAddresses.get({
      walletAccount,
      assetName,
    })

    expect(txLogsAtom.get).not.toHaveBeenCalled()
    expect(addressesFromCache).toEqual(expectedAddresses)
  })

  it('should retrieve addresses from cache for multisig wallet account', async () => {
    const addresses = await knownAddresses.get({
      walletAccount: multisigWalletAccount,
      assetName,
    })

    expect(addresses).toEqual(expectedAddresses)

    jest.spyOn(txLogsAtom, 'get')

    const addressesFromCache = await knownAddresses.get({
      walletAccount: multisigWalletAccount,
      assetName,
    })

    expect(txLogsAtom.get).not.toHaveBeenCalled()
    expect(addressesFromCache).toEqual(expectedAddresses)
  })

  it('should bust cache on tx-log-update', async () => {
    await knownAddresses.get({
      walletAccount,
      assetName,
    })

    const address = {
      address: 'c',
      meta: { path: 'm/0/2', purpose: 44 },
    }
    await blockchainMetadata.updateTxs({
      assetName,
      walletAccount,
      txs: [
        {
          coinName: assetName,
          coinAmount: '0.00184082 BTC',
          txId: '92',
          addresses: [address],
          currencies: { bitcoin: bitcoin.currency },
        },
      ],
    })

    const updatedAddresses = [...expectedAddresses]

    updatedAddresses.splice(2, 0, {
      address: expect.objectContaining({
        ...address,
        meta: {
          purpose: 44,
          path: 'm/0/2',
          walletAccount: walletAccount.toString(),
          keyIdentifier: new KeyIdentifier({
            assetName: 'bitcoin',
            derivationAlgorithm: 'BIP32',
            derivationPath: "m/44'/0'/0'/0/2",
            keyType: 'secp256k1',
          }),
        },
      }),
      addressIndex: 2,
      chainIndex: 0,
      purpose: 44,
    })

    await expect(
      knownAddresses.get({
        walletAccount,
        assetName,
      })
    ).resolves.toEqual(updatedAddresses)
  })

  it('should no longer be subscribed after stopping', async () => {
    await knownAddresses.get({
      walletAccount,
      assetName,
    })

    const address = {
      address: 'c',
      meta: { path: 'm/0/2', purpose: 44 },
    }

    knownAddresses.stop()

    await blockchainMetadata.updateTxs({
      assetName,
      walletAccount,
      txs: [
        {
          coinName: assetName,
          coinAmount: '0.00184082 BTC',
          txId: '92',
          addresses: [address],
          currencies: { bitcoin: bitcoin.currency },
        },
      ],
    })

    await expect(
      knownAddresses.get({
        walletAccount,
        assetName,
      })
    ).resolves.toEqual(expectedAddresses)
  })
})
