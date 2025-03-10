/* eslint-disable jest/no-duplicate-hooks */
/* eslint-disable jest/prefer-hooks-on-top */
import { createInMemoryAtom } from '@exodus/atoms'
import bip44Constants from '@exodus/bip44-constants/by-ticker.js'
import { createGetKeyIdentifier } from '@exodus/bitcoin-lib'
import KeyIdentifier from '@exodus/key-identifier'
import { Address, TxSet, WalletAccount } from '@exodus/models'
import createInMemoryStorage from '@exodus/storage-memory'

import addressProviderDefinition from '../../../module/address-provider.js'
import { createMockableAddressProvider } from '../../../module/mock.js'
import { assets, seedId, setup, walletAccount, walletAccount2 } from '../utils.js'
import { wallets } from './fixtures/index.js'

const { bitcoin } = assets
const assetName = bitcoin.name
const { factory: createAddressProvider } = addressProviderDefinition

const legacyFixture = wallets.valid[0].bip44.coins[0].accounts[0] // m/44'/0'/0'
const segwitFixture = wallets.valid[0].bip84.coins[0].accounts[0] // m/84'/0'/0'
const taprootFixture = wallets.valid[0].bip86.coins[0].accounts[0] // m/86'/0'/0'

const multisigWalletAccount = new WalletAccount({
  ...WalletAccount.DEFAULT,
  seedId,
  isMultisig: true,
})

const createTestTxLog = () => {
  const addresses = {
    // legacy
    "m/44'/0'/0'/0/0": legacyFixture.chains[0].addresses[0].address,
    "m/44'/0'/0'/0/1": legacyFixture.chains[0].addresses[1].address,
    "m/44'/0'/0'/0/2": legacyFixture.chains[0].addresses[2].address,
    "m/44'/0'/0'/1/0": legacyFixture.chains[1].addresses[0].address,
    "m/44'/0'/0'/1/1": legacyFixture.chains[1].addresses[1].address,
    // segwit
    "m/84'/0'/0'/0/0": segwitFixture.chains[0].addresses[0].address,
    "m/84'/0'/0'/0/1": segwitFixture.chains[0].addresses[1].address,
    "m/84'/0'/0'/0/2": segwitFixture.chains[0].addresses[2].address,
    "m/84'/0'/0'/1/0": segwitFixture.chains[1].addresses[0].address,
    "m/84'/0'/0'/1/1": segwitFixture.chains[1].addresses[1].address,
    // taproot
    "m/86'/0'/0'/0/0": taprootFixture.chains[0].addresses[0].address,
    "m/86'/0'/0'/0/1": taprootFixture.chains[0].addresses[1].address,
    "m/86'/0'/0'/1/0": taprootFixture.chains[1].addresses[0].address,
    "m/86'/0'/0'/1/1": taprootFixture.chains[1].addresses[1].address,
  }

  // const walletAccounts = {
  //   [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
  // }

  // NOT USED YET
  // const accountState = {
  //   [WalletAccount.DEFAULT_NAME]: {
  //     bitcoin: {
  //       chainState: {
  //         44: [2, 0],
  //         84: [1, 0],
  //         86: [1, 0],
  //       },
  //     },
  //   },
  // }

  return {
    [walletAccount.toString()]: {
      bitcoin: TxSet.fromArray([
        // legacy
        {
          coinName: 'bitcoin',
          txId: '1',
          addresses: [
            {
              address: addresses["m/44'/0'/0'/0/0"],
              meta: { path: 'm/0/0' },
            },
          ],
          data: {
            changeAddress: {
              address: addresses["m/44'/0'/0'/1/0"],
              meta: { path: 'm/1/0' }, // legacy: no "purpose" field
            },
          },
          currencies: { bitcoin: bitcoin.currency },
        },
        {
          coinName: 'bitcoin',
          txId: '2',
          addresses: [
            {
              address: addresses["m/44'/0'/0'/0/1"],
              meta: { path: 'm/0/1' },
            },
          ],
          currencies: { bitcoin: bitcoin.currency },
        },
        // segwit
        {
          coinName: 'bitcoin',
          txId: '3',
          addresses: [
            {
              address: addresses["m/84'/0'/0'/0/0"],
              meta: { path: 'm/0/0', isSegwit: true },
            },
          ],
          data: {
            changeAddress: {
              address: addresses["m/84'/0'/0'/1/0"],
              meta: { path: 'm/1/0', purpose: 84 }, // with purpose
            },
          },
          currencies: { bitcoin: bitcoin.currency },
        },
        // taproot
        {
          coinName: 'bitcoin',
          txId: '4',
          addresses: [
            {
              address: addresses["m/86'/0'/0'/0/0"],
              meta: { path: 'm/0/0', isTaproot: true },
            },
          ],
          data: {
            changeAddress: {
              address: addresses["m/86'/0'/0'/1/0"],
              meta: { path: 'm/1/0', isTaproot: true }, // legacy: isTaproot flag
            },
          },
          currencies: { bitcoin: bitcoin.currency },
        },
      ]),
    },

    [walletAccount2.toString()]: {
      bitcoin: TxSet.fromArray([
        // no legacy
        {
          coinName: 'bitcoin',
          txId: '3',
          addresses: [
            {
              address: addresses["m/84'/0'/0'/0/1"],
              meta: { path: 'm/0/1', isSegwit: true },
            },
          ],
          data: {
            changeAddress: {
              address: addresses["m/84'/0'/0'/1/0"],
              meta: { path: 'm/1/0', purpose: 84 }, // with purpose
            },
          },
          currencies: { bitcoin: bitcoin.currency },
        },
        // taproot
        {
          coinName: 'bitcoin',
          txId: '2',
          addresses: [
            {
              address: addresses["m/86'/0'/0'/0/0"],
              meta: { path: 'm/0/0', isTaproot: true },
            },
          ],
          data: {
            changeAddress: {
              address: addresses["m/86'/0'/0'/1/0"],
              meta: { path: 'm/1/0', isTaproot: true }, // legacy: isTaproot flag
            },
          },
          currencies: { bitcoin: bitcoin.currency },
        },
      ]),
    },
  }
}

const addressProviderTester = (mock) => {
  let addressProvider

  beforeEach(() => {
    const {
      assetsModule,
      accountStatesAtom,
      walletAccountsAtom,
      assetSources,
      publicKeyProvider,
      knownAddresses,
      addressCache,
    } = setup({ txLogs: createTestTxLog() })

    if (mock) {
      addressProvider = createMockableAddressProvider({
        assetsModule,
        accountStatesAtom,
        walletAccountsAtom,
        assetSources,
        publicKeyProvider,
        knownAddresses,
        addressCache,
        unsafeStorage: createInMemoryStorage(),
      })
    } else {
      addressProvider = createAddressProvider({
        assetsModule,
        addressCache,
        accountStatesAtom,
        publicKeyProvider,
        knownAddresses,
        walletAccountsAtom,
        assetSources,
      })
    }
  })

  test('getAddress() returns address for hardened chain index', async () => {
    const address = await addressProvider.getAddress({
      assetName,
      walletAccount,
      purpose: 44,
      chainIndex: 1,
      addressIndex: 55,
    })

    expect(address.toJSON()).toEqual({
      address: '15HfUQcQzyMXmonEzq3c5Gu25zNZicaKC1',
      meta: expect.objectContaining({
        path: 'm/1/55',
        purpose: 44,
      }),
    })
  })

  test('getEncodedPublicKey() returns address', async () => {
    await expect(
      addressProvider.getEncodedPublicKey({
        assetName,
        walletAccount: multisigWalletAccount,
        purpose: 44,
        chainIndex: 1,
        addressIndex: 55,
      })
    ).resolves.toEqual('15HfUQcQzyMXmonEzq3c5Gu25zNZicaKC1')
  })

  test('getUnusedAddress() should return the next unused address on the receive chains (BITCOIN ONLY ATM)', async () => {
    /*
    what's happening here is we leverage the fact that each TX we receive logs the addresses in the wallet.
    Since Exodus is only ever watching receive addresses, we know the unique set of all addresses we currently have
    the next unused address is what Exodus should be watching.
  */

    const legacy = await addressProvider.getUnusedAddress({
      purpose: 44,
      assetName,
      walletAccount,
      chainIndex: 0,
    })

    expect(legacy.toString()).toEqual(legacyFixture.chains[0].addresses[2].address)
    expect(legacy.meta.path).toEqual('m/0/2')

    for (const useCache of [false, true]) {
      const legacyExplicit = await addressProvider.getAddress({
        assetName,
        walletAccount,
        purpose: 44,
        chainIndex: 0,
        addressIndex: 2,
        useCache,
      })
      expect(legacyExplicit).toEqual(legacy)
    }

    const segwit = await addressProvider.getUnusedAddress({
      walletAccount,
      purpose: 84,
      assetName,
      chainIndex: 0,
    })

    expect(segwit.toString()).toEqual(segwitFixture.chains[0].addresses[1].address)
    expect(segwit.meta.path).toEqual('m/0/1')

    for (const useCache of [false, true]) {
      const segwitImplicity = await addressProvider.getUnusedAddress({
        walletAccount,
        assetName,
        chainIndex: 0,
        useCache,
      })

      expect(segwitImplicity).toEqual(
        Address.create(segwitFixture.chains[0].addresses[1].address, {
          path: 'm/0/1',
          purpose: 84,
          walletAccount: walletAccount.toString(),
          keyIdentifier: expect.any(KeyIdentifier),
        })
      )
    }

    for (const useCache of [false, true]) {
      const taproot = await addressProvider.getUnusedAddress({
        walletAccount,
        purpose: 86,
        assetName,
        chainIndex: 0,
        useCache,
      })

      expect(taproot).toEqual(
        Address.create(taprootFixture.chains[0].addresses[1].address, {
          path: 'm/0/1',
          purpose: 86,
          walletAccount: walletAccount.toString(),
          keyIdentifier: expect.any(KeyIdentifier),
        })
      )
    }
  })
  test('getUnusedAddress() should return the next unused address on the change chains (BITCOIN ONLY ATM)', async () => {
    const legacy = await addressProvider.getUnusedAddress({
      purpose: 44,
      assetName,
      walletAccount,
      chainIndex: 1,
    })

    expect(legacy.toString()).toEqual(legacyFixture.chains[1].addresses[1].address)
    expect(legacy.meta.path).toEqual('m/1/1')

    for (const useCache of [false, true]) {
      const legacyExplicit = await addressProvider.getAddress({
        assetName,
        walletAccount,
        purpose: 44,
        chainIndex: 1,
        addressIndex: 1,
        useCache,
      })

      expect(legacy).toEqual(legacyExplicit)
    }

    for (const useCache of [false, true]) {
      const segwit = await addressProvider.getUnusedAddress({
        walletAccount,
        purpose: 84,
        assetName,
        chainIndex: 1,
        useCache,
      })

      expect(segwit).toEqual(
        Address.create(segwitFixture.chains[1].addresses[1].address, {
          path: 'm/1/1',
          purpose: 84,
          walletAccount: walletAccount.toString(),
          keyIdentifier: expect.any(KeyIdentifier),
        })
      )
    }

    for (const useCache of [false, true]) {
      const taproot = await addressProvider.getUnusedAddress({
        walletAccount,
        purpose: 86,
        assetName,
        chainIndex: 1,
        useCache,
      })

      expect(taproot).toEqual(
        Address.create(taprootFixture.chains[1].addresses[1].address, {
          path: 'm/1/1',
          purpose: 86,
          walletAccount: walletAccount.toString(),
          keyIdentifier: expect.any(KeyIdentifier),
        })
      )
    }
  })

  test('getUnusedAddressIndexes() should return the structure with all unused addresses indexes', async () => {
    const unusedAddressIndexes = await addressProvider.getUnusedAddressIndexes({
      assetName,
      walletAccount,
    })
    expect(unusedAddressIndexes).toEqual([
      { purpose: 84, chain: [1, 1] },
      { purpose: 86, chain: [1, 1] },
      { purpose: 44, chain: [2, 1] },
    ])
  })
  test('getUnusedAddressIndexes() should return the structure with all max unused addresses indexes', async () => {
    const unusedAddressIndexes = await addressProvider.getUnusedAddressIndexes({
      assetName,
      walletAccount,
      highestUnusedIndexes: true,
    })
    expect(unusedAddressIndexes).toEqual([
      { purpose: 84, chain: [1, 1] },
      { purpose: 86, chain: [1, 1] },
      { purpose: 44, chain: [2, 1] },
    ])
  })

  test('getUnusedAddressIndexes() with gaps should return the structure with all unused addresses indexes wallet2', async () => {
    const unusedAddressIndexes = await addressProvider.getUnusedAddressIndexes({
      assetName,
      walletAccount: walletAccount2,
    })
    expect(unusedAddressIndexes).toEqual([
      { purpose: 84, chain: [0, 1] },
      { purpose: 86, chain: [1, 1] },
      { purpose: 44, chain: [0, 0] },
    ])
  })

  test('getUnusedAddressIndexes() with gaps should return the structure with all max unused addresses indexes wallet2', async () => {
    const unusedAddressIndexes = await addressProvider.getUnusedAddressIndexes({
      assetName,
      walletAccount: walletAccount2,
      highestUnusedIndexes: true,
    })
    expect(unusedAddressIndexes).toEqual([
      { purpose: 84, chain: [2, 1] },
      { purpose: 86, chain: [1, 1] },
      { purpose: 44, chain: [0, 0] },
    ])
  })

  test('getReceiveAddress() should respect multiAddressMode', async () => {
    const defaultAddress = await addressProvider.getReceiveAddress({
      multiAddressMode: false,
      walletAccount,
      assetName,
    })

    expect(defaultAddress.toString()).toEqual(segwitFixture.chains[0].addresses[0].address)
    const unusedReceiveAddress = await addressProvider.getReceiveAddress({
      multiAddressMode: true,
      walletAccount,
      assetName,
    })

    const unusedExpected = await addressProvider.getUnusedAddress({
      walletAccount,
      assetName,
      chainIndex: 0,
    })

    expect(unusedReceiveAddress).toEqual(unusedExpected)
  })

  test('getChangeAddress() should respect multiAddressMode', async () => {
    const defaultAddress = await addressProvider.getChangeAddress({
      multiAddressMode: false,
      walletAccount,
      assetName,
    })

    expect(defaultAddress.toString()).toEqual(segwitFixture.chains[1].addresses[0].address)
    const unusedChangeAddress = await addressProvider.getChangeAddress({
      multiAddressMode: true,
      walletAccount,
      assetName,
    })

    const unusedExpected = await addressProvider.getUnusedAddress({
      walletAccount,
      assetName,
      chainIndex: 1,
    })

    expect(unusedChangeAddress).toEqual(unusedExpected)
  })

  test('getReceiveAddresses() should return the set of all addresses Exodus watches to receive (BITCOIN ONLY ATM)', async () => {
    /*
    what's happening here is we leverage the fact that each TX we receive logs the addresses in the wallet.
    Since Exodus is only ever watching receive addresses, we know the unique set of all addresses we currently have
    + 1 is what Exodus should be watching.
  */

    const set = await addressProvider.getReceiveAddresses({
      multiAddressMode: true,
      walletAccount,
      assetName,
    })

    expect([...set].sort().map((address) => address.toString())).toEqual(
      [
        // legacy
        legacyFixture.chains[0].addresses[0].address,
        legacyFixture.chains[0].addresses[1].address,
        legacyFixture.chains[0].addresses[2].address, // legacy first unused

        // segwit
        segwitFixture.chains[0].addresses[0].address,
        segwitFixture.chains[0].addresses[1].address, // segwit first unused
        // taproot
        taprootFixture.chains[0].addresses[0].address,
        taprootFixture.chains[0].addresses[1].address, // taproot first unused
      ].sort()
    )

    const singleAddressMode = await addressProvider.getReceiveAddresses({
      walletAccount,
      assetName,
    })

    expect([...singleAddressMode].map((address) => address.toString())).toEqual([
      // legacy
      segwitFixture.chains[0].addresses[0].address,
    ])
  })

  test('getReceiveAddresses() when empty TxLog', async () => {
    // When there is no transactions, getReceiveAddresses multiAddressMode should return addressIndex=0 addresses
    const { addressProvider } = setup({
      txLogs: {},
    })

    const set = await addressProvider.getReceiveAddresses({
      multiAddressMode: true,
      walletAccount,
      assetName,
    })

    expect([...set].sort().map((address) => address.toString())).toEqual(
      [
        // legacy
        legacyFixture.chains[0].addresses[0].address, // legacy first unused
        // segwit
        segwitFixture.chains[0].addresses[0].address, // segwit first unused
        // taproot
        taprootFixture.chains[0].addresses[0].address, // taproot first unused
      ].sort()
    )

    const singleAddressMode = await addressProvider.getReceiveAddresses({
      walletAccount,
      assetName,
    })

    expect([...singleAddressMode].map((address) => address.toString())).toEqual([
      // legacy
      segwitFixture.chains[0].addresses[0].address,
    ])
  })

  test('getChangeAddresses() should return the set of all addresses Exodus watches to receive (BITCOIN ONLY ATM)', async () => {
    const set = await addressProvider.getChangeAddresses({
      multiAddressMode: true,
      walletAccount,
      assetName,
    })

    expect([...set].sort().map((address) => address.toString())).toEqual(
      [
        // legacy
        legacyFixture.chains[1].addresses[0].address,
        legacyFixture.chains[1].addresses[1].address, // legacy first unused

        // segwit
        segwitFixture.chains[1].addresses[0].address,
        segwitFixture.chains[1].addresses[1].address, // segwit first unused
        // taproot
        taprootFixture.chains[1].addresses[0].address,
        taprootFixture.chains[1].addresses[1].address, // taproot first unused
      ].sort()
    )

    const addresses = await addressProvider.getChangeAddresses({
      walletAccount,
      assetName,
    })

    expect([...addresses].map((address) => address.toString())).toEqual([
      // legacy
      segwitFixture.chains[1].addresses[0].address,
    ])
  })

  test('getSupportedPurposes() should return the list for bitcoin', async () => {
    const asset = assets.bitcoin

    const supportedPurposes = await addressProvider.getSupportedPurposes({
      assetName: asset.name,
      walletAccount,
    })

    expect(supportedPurposes).toEqual([84, 86, 44])
  })

  describe('isOwnAddress()', () => {
    describe('single address', () => {
      test('returns true for own address at index 0', async () => {
        await expect(
          addressProvider.isOwnAddress({
            walletAccount,
            assetName,
            address: segwitFixture.chains[0].addresses[0].address,
          })
        ).resolves.toBe(true)
      })

      test('returns false for own address at index 1', async () => {
        await expect(
          addressProvider.isOwnAddress({
            walletAccount,
            assetName,
            address: segwitFixture.chains[0].addresses[1].address,
          })
        ).resolves.toBe(false)
      })

      test('returns false for other address', async () => {
        await expect(
          addressProvider.isOwnAddress({
            walletAccount,
            assetName,
            address: 'gotham city main street',
          })
        ).resolves.toBe(false)
      })
    })

    describe('multi address mode', () => {
      test('returns true for own address at index 0', async () => {
        await expect(
          addressProvider.isOwnAddress({
            walletAccount,
            assetName,
            multiAddressMode: true,
            address: segwitFixture.chains[0].addresses[0].address,
          })
        ).resolves.toBe(true)
      })

      test('returns true for own address at index 1', async () => {
        await expect(
          addressProvider.isOwnAddress({
            walletAccount,
            assetName,
            multiAddressMode: true,
            address: segwitFixture.chains[0].addresses[1].address,
          })
        ).resolves.toBe(true)
      })

      test('returns false for other address', async () => {
        await expect(
          addressProvider.isOwnAddress({
            walletAccount,
            assetName,
            multiAddressMode: true,
            address: 'gotham city main street',
          })
        ).resolves.toBe(false)
      })
    })

    test('throws for undefined address', async () => {
      await expect(
        addressProvider.isOwnAddress({
          walletAccount,
          assetName,
        })
      ).rejects.toThrow()
    })

    test('throws for empty address', async () => {
      await expect(
        addressProvider.isOwnAddress({
          walletAccount,
          assetName,
          address: '',
        })
      ).rejects.toThrow()
    })
  })
}

describe('bitcoin real address provider test', () => addressProviderTester(false))
describe('bitcoin mock address provider test', () => addressProviderTester(true))

const multisigAddressProviderTester = () => {
  let addressProvider
  let publicKeyProvider
  let multisigAtom

  beforeEach(async () => {
    multisigAtom = createInMemoryAtom()
    ;({ addressProvider, publicKeyProvider } = setup({
      txLogs: createTestTxLog(),
      assets: {
        ...assets,
        bitcoinByPublicKey: {
          ...bitcoin,
          baseAssetName: 'bitcoinByPublicKey',
          api: {
            ...bitcoin.api,
            features: {
              ...bitcoin.api.features,
              multipleAddresses: false,
            },
          },
        },
      },
      multisigAtom,
    }))

    const bitcoinKeyIdentifierFactory = createGetKeyIdentifier({
      bip44: bip44Constants.BTC,
      allowedPurposes: [86],
    })

    const assetPublicKeys = await Promise.all(
      [0, 1, 2].map(async (i) => {
        const xpub = await publicKeyProvider.getExtendedPublicKey({
          keyIdentifier: Object.freeze(
            bitcoinKeyIdentifierFactory({ purpose: 86, accountIndex: i })
          ),
          walletAccount: multisigWalletAccount.toString(),
        })
        const publicKey = await publicKeyProvider.getPublicKey({
          keyIdentifier: Object.freeze(
            bitcoinKeyIdentifierFactory({
              purpose: 86,
              accountIndex: i,
              addressIndex: 0,
              chainIndex: 0,
            })
          ),
          walletAccount: multisigWalletAccount.toString(),
        })
        return {
          bitcoin: xpub,
          bitcoinByPublicKey: publicKey.toString('hex'),
        }
      })
    )

    multisigAtom.set({
      [multisigWalletAccount.toString()]: {
        id: '1',
        threshold: 2,
        version: 0,
        cosigners: [
          {
            nick: 'cosigner1',
            assetPublicKeys: assetPublicKeys[0],
          },
          {
            nick: 'cosigner2',
            assetPublicKeys: assetPublicKeys[1],
          },
          {
            nick: 'cosigner3',
            assetPublicKeys: assetPublicKeys[2],
          },
        ],
        internalXpub: assetPublicKeys[0].bitcoin,
      },
    })
  })

  test('getAddress() returns address for multisig', async () => {
    const address = await addressProvider.getAddress({
      assetName,
      walletAccount: multisigWalletAccount,
      purpose: 86,
      chainIndex: 0,
      addressIndex: 0,
    })

    expect(address.toJSON()).toMatchObject({
      address: 'bc1pmg86fr9eu48aqr3pxu4aw8aff6t3q77yw6mks0c5lca4k0s9ys7qgx786t',
      meta: {
        path: 'm/0/0',
        purpose: 86,
        walletAccount: multisigWalletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      },
    })
  })
  test('getAddress() returns address for multisig using public key', async () => {
    const address = await addressProvider.getAddress({
      assetName: 'bitcoinByPublicKey',
      walletAccount: multisigWalletAccount,
      purpose: 86,
      chainIndex: 0,
      addressIndex: 0,
    })

    expect(address.toJSON()).toMatchObject({
      address: 'bc1pmg86fr9eu48aqr3pxu4aw8aff6t3q77yw6mks0c5lca4k0s9ys7qgx786t',
      meta: {
        path: 'm/0/0',
        purpose: 86,
        walletAccount: multisigWalletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      },
    })
  })

  test('getAddress() fails with segwit purpose for multisig', async () => {
    await expect(
      addressProvider.getAddress({
        assetName,
        walletAccount: multisigWalletAccount,
        purpose: 84,
        chainIndex: 0,
        addressIndex: 0,
      })
    ).rejects.toThrow()
  })
}

describe('bitcoin multisig address provider test', () => multisigAddressProviderTester())
