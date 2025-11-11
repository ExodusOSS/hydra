import { signMessage as signMessageWithSignerAlgorand } from '@exodus/algorand-lib'
import { mnemonicToSeed } from '@exodus/bip39'
import bip44Constants from '@exodus/bip44-constants/by-ticker.js'
import { signMessageWithSigner as signMessageWithSignerBitcoin } from '@exodus/bitcoin-api'
import { signMessage as signMessageWithSignerCardano } from '@exodus/cardano-lib'
import { signMessageWithSigner as signMessageWithSignerEthereum } from '@exodus/ethereum-lib'
import { createGetKeyIdentifier } from '@exodus/key-utils'
import keychainDefinition from '@exodus/keychain/module'
import { getSeedId } from '@exodus/keychain/module/crypto/seed-id'
import { WalletAccount } from '@exodus/models'
import { SEED_SRC } from '@exodus/models/lib/wallet-account'
import { signMessageWithSigner as signMessageWithSignerSolana } from '@exodus/solana-lib'

import seedSignerDefinition from '../seed-signer.js'

// See the patches in https://github.com/ExodusMovement/exodus-hydra/pull/13835 for updating these fixtures.
const fixtures = {
  ethereum: {
    signaturesForRawMessages: [
      'accb153753251c638921868beb915d47987cfc7425dd30ab730e6f6a4224b9e433c1ec5810276c64a2022f85a4370264cb69fc0038d0b737591a489cebbb3af81b',
      'c9a64b4e09fd45a2db41279e6ad633417d82db52a44c2654820505212ddabeaa62ba06a4907cbc9a6b3af657088bd388d615e9fe7686c10b99454f81c99a5d7e1c',
      '005ec24d9a4d22f08f28ce35deecf3a1479f2d6db508261299425a097341874a101111b7459a3efaecb0a54b8ee55ee869dcda4b2c47daba7ecbe589e696546d1c',
    ],
    signaturesForEIP712Messages: [
      '137b082e9cda92c58bcaaf72ca5e9b7609990d3b995c055a5992d29ea021ea9757d6f977c367eb483dc87ccaca900aadb848d82c0a1d8c05181a66a49caf0a511c',
      'f98e90469fbbd74ab58972dd7431aeb6e9e93fb612a197b0ca62199daa7a28f42ba00c06e3f34f06e0591e059052cc3756e68ae28abdfb143da5e7dd8fde45ff1b',
      '159feb1cbc2dc070a65d128b7fdb6340b50569253f6461e8042b78a4e87bf3416efd4fb6490dee32a3e6a75c97ae0d2b97ab64b49fca063a0a791ebee709c2d91b',
    ],
  },
  bitcoin: {
    NativeSegWitAddresses: [
      'bc1q07k0qkxf8sy2c8cvfc9gntdnusc4k92h854w9f',
      'bc1qe0j65kz7nmeuamdlnnzekwvddx46pgnugnethj',
      'bc1qaxkmdwrwrwcms4sgruj5ultalg5n94s2c8ym0a',
    ],
    ECDSAsignatures: [
      '0248304502210097a0fa9e2cce0ee992ba46fc67715d6830b206b197571571d345fae9e8f6809c022030aa8563fd358cefafd3501f8db069c4f9c89033fb5d2029c96b8c8bd4fba5e7012102870b2665a6479a816630d826e0abd6e457819040674bcb06ba9fbe64cf2a7426',
      '02483045022100cca339089c4a687304111f81f798860b36c4f46b6becbbcf61ec3a234765c719022058313b03be6f91d149aac6eee8c55cc056a5f3d4b66235ecfc3fed3e3dbcb733012102b887c5a46101df31b839bb604f93e539b5a03d52e13b51d071a2ff8bcf86c258',
      '0247304402205a41b3f3c33cfbbf27375036f9f515bf55e800905c852fe13cf790e84cd18d55022002cc194526f3c52a43d988b4f7d2c5e42ce7e39fc09a489b3ec049a5bc33407501210233749973a3f5304bea52b0bbe08cca01ce9ef804cef60fc3f1ceffc6bb8f807f',
    ],
  },
  solana: {
    signaturesForRawMessages: [
      '61e062a1b7547d34fb3762e9e8bde702517dc42a0eb0eb03f8f5658ff9aeffbe2002b8bdf6c27cee8de0aaf82ed7e46a4d5012226407daa6bcee18902f137501',
      '298d663d3ac757cef5b0c928df0e4f8f2bf506e41ce588864d7dd046961bcac3e52bb154baa33e65ea8ed9ff287de51261157c30bf8634c26644c0a1fbfb4800',
      '7060a98e2da21569bd772c657631fef5216b84df294565409e31840f4220f9f6b40096998fb420f6d4c3ecfe3d165ec4c9b1e0c56def25d70d076a77322cfd00',
    ],
  },
  cardano: {
    addresses: [
      'addr1q8ftlrj30s8f3qks2l5cuv44f5cgflxqym0d0k4q22dusp7jh789zlqwnzpdq4lf3cet2nfssn7vqfk76ld2q55meqrstsxtqg',
      'addr1qyf306w0ln5dhpvc2ascp695v6f8ap6d7l2gm2w953tg73snzl5ull8gmwzes4mpsr5tge5j06r5ma753k5utfzk3arquzkfsr',
      'addr1qxv5lttd3wx5ugf5n5awn0z5ddmf9h7ctvgwprvh3ueg825ef7kkmzudfcsnf8f6ax79g6mkjt0askcsuzxe0rejsw4qzgae04',
    ],
    signatures: [
      '844da20127676164647265737341ada166686173686564f44b68656c6c6f20776f726c6458403309351b19782dd2a956b5b224b60de0accdaaed08a1a3a7365c3f088516f3918d39c72288cd6cc59b8bf45ec4c062d235197e6c95452a989a94312d97743c00',
      '844da20127676164647265737341ada166686173686564f44b68656c6c6f20776f726c645840c90b3fdf3bcc1495851972c7cc56d33d3dfeba8c02da79b4ee34c7886211ee83f50cb771e76d396a5dab63aaeef24f93a73552245dbd7693c62f13fb3bb9c700',
      '844da20127676164647265737341ada166686173686564f44b68656c6c6f20776f726c64584095794d2343022dbeb9723717e56069c3548e42e1f89ab70e8f362ddd46c0bc80a4c9970ea7ee9352a579d874d01b8ba8197fde37d1a66431ca286d02c07db701',
    ],
    keys: [
      'a4010103272006215820b45e8123277ae328d07adfe64d8dedb54f44aa4346eb2fb9d544dd2bc2060f4e',
      'a4010103272006215820ec93d27123f39eba74aed8f2a8cd9e90b83db136c67687eab33137bce97ca4d1',
      'a40101032720062158208a3bf913b8dd70bbb69eb67b4f606a315d0a57fbf58377f74c5182fc789b9a0e',
    ],
  },
  algorand: {
    signaturesForRawMessages: [
      '9706014b14687fbfe18b240c41c3b32bc171184b4da6759907ad7db9ed51de57a9aade841314e371dfd527fd58a9fadf5be7464a636a96b73d649e4d8d939e0d',
      '1a4f361e74c5249ef0894329380785f52651f08e5cec463ce66e2ab72cd9b8d964a5e891fd70a1ed05344e8b5e4f8fc4d1833660f0ee028795b11cedc6f8bc08',
      '9a88b91aa5f68b19417a5b0e4f57d8316075a8ad696df4164d6be156510a15c11b5700fa45d5ed9160aeafff0feade22571a9561acc039205e8f30be161bd906',
    ],
  },
}
const PORTFOLIO_INDEXES = [0, 1, 2]

const SEED = await mnemonicToSeed({
  mnemonic: 'menu memory fury language physical wonder dog valid smart edge decrease worth',
})
const seedId = await getSeedId(SEED)

const keyIdentifierOpts = {
  purpose: 44,
  chainIndex: 0,
  addressIndex: 0,
}
const commonFeatures = {
  signMessageWithSigner: true,
}

const assets = {
  ethereum: {
    api: {
      defaultAddressPath: 'm/0/0',
      getKeyIdentifier: ({ accountIndex = 0 }) =>
        createGetKeyIdentifier({
          bip44: bip44Constants['ETH'],
          assetName: 'ethereum',
          keyType: 'secp256k1',
        })({
          ...keyIdentifierOpts,
          accountIndex,
        }),
      signMessage: ({ signer, message }: { signer: unknown; message: unknown }) =>
        signMessageWithSignerEthereum({ signer, message }),
      features: {
        ...commonFeatures,
      },
    },
    get baseAsset() {
      return assets.ethereum
    },
  },
  bitcoin: {
    api: {
      defaultAddressPath: 'm/0/0',
      getKeyIdentifier: ({ accountIndex = 0 }) =>
        createGetKeyIdentifier({
          bip44: bip44Constants['BTC'],
          assetName: 'bitcoin',
          keyType: 'secp256k1',
        })({
          ...keyIdentifierOpts,
          accountIndex,
        }),
      signMessage: ({ signer, message }: { signer: unknown; message: unknown }) =>
        signMessageWithSignerBitcoin({ signer, message }),
      features: {
        ...commonFeatures,
      },
    },
    get baseAsset() {
      return assets.bitcoin
    },
  },
  solana: {
    api: {
      defaultAddressPath: 'm/0/0',
      getKeyIdentifier: ({ accountIndex = 0 }) =>
        createGetKeyIdentifier({
          bip44: bip44Constants['SOL'],
          assetName: 'solana',
          keyType: 'nacl',
          derivationAlgorithm: 'SLIP10',
        })({
          ...keyIdentifierOpts,
          accountIndex,
        }),
      signMessage: ({ signer, message }: { signer: unknown; message: unknown }) =>
        signMessageWithSignerSolana({ signer, message }),
      features: {
        ...commonFeatures,
      },
    },
    get baseAsset() {
      return assets.solana
    },
  },
  cardano: {
    api: {
      defaultAddressPath: 'm/0/0',
      getKeyIdentifier: ({ accountIndex = 0 }) =>
        createGetKeyIdentifier({
          bip44: bip44Constants['ADA'],
          assetName: 'cardano',
          keyType: 'cardanoByron',
        })({
          ...keyIdentifierOpts,
          accountIndex,
        }),
      signMessage: ({ signer, message }: { signer: unknown; message: unknown }) =>
        signMessageWithSignerCardano({ signer, message }),
      features: {
        ...commonFeatures,
      },
    },
    get baseAsset() {
      return assets.cardano
    },
  },
  algorand: {
    api: {
      defaultAddressPath: 'm/0/0',
      getKeyIdentifier: ({ accountIndex = 0 }) =>
        createGetKeyIdentifier({
          bip44: bip44Constants['ALGO'],
          assetName: 'algorand',
          keyType: 'nacl',
          derivationAlgorithm: 'BIP32',
        })({
          ...keyIdentifierOpts,
          accountIndex,
        }),
      signMessage: ({ signer, message }: { signer: unknown; message: unknown }) =>
        signMessageWithSignerAlgorand({ signer, message }),
      features: {
        ...commonFeatures,
      },
    },
    get baseAsset() {
      return assets.algorand
    },
  },
}

const assetsModule = {
  getAsset: (assetName: keyof typeof assets) => assets[assetName],
}

const setup = async () => {
  const keychain = keychainDefinition.factory({
    logger: console,
  })

  await keychain.addSeed(SEED)
  const seedSigner = seedSignerDefinition.factory({
    assetsModule: assetsModule as never,
    keychain,
    assetSources: {
      getSupportedPurposes: async () => [44],
    },
  })

  return {
    keychain,
    seedSigner,
  }
}

describe('SeedBasedMessageSigner', () => {
  it('signs a raw message with the signer feature (Ethereum)', async () => {
    for (const index of PORTFOLIO_INDEXES) {
      const messageToSign = 'hello world'
      const { seedSigner } = await setup()
      const walletAccount = new WalletAccount({ index, source: SEED_SRC, seedId })
      const signedMessage = await seedSigner.signMessage({
        baseAssetName: 'ethereum',
        walletAccount,
        message: {
          rawMessage: Buffer.from(messageToSign, 'utf8'),
        },
      })

      expect(signedMessage.toString('hex')).toEqual(
        fixtures.ethereum.signaturesForRawMessages[index]
      )
    }
  })

  it('signs an EIP-712 message with the signer feature (Ethereum)', async () => {
    for (const index of PORTFOLIO_INDEXES) {
      const EIP712Message = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' },
          ],
        },
        primaryType: 'Person',
        domain: {
          name: 'MyDApp',
          version: '1',
          chainId: 1,
          verifyingContract: '0x0000000000000000000000000000000000000000',
        },
        message: {
          name: 'Alice',
          wallet: '0x0000000000000000000000000000000000000000',
        },
      }
      const { seedSigner } = await setup()
      const walletAccount = new WalletAccount({ index, source: SEED_SRC, seedId })
      const signedMessage = await seedSigner.signMessage({
        baseAssetName: 'ethereum',
        walletAccount,
        message: {
          EIP712Message,
        },
      })

      expect(signedMessage.toString('hex')).toEqual(
        fixtures.ethereum.signaturesForEIP712Messages[index]
      )
    }
  })

  // Taproot signing is not supported by the Bitcoin library (yet).
  it('signs a message with the signer (Bitcoin Native SegWit)', async () => {
    for (const index of PORTFOLIO_INDEXES) {
      const messageToSign = 'hello world'
      const walletAccount = new WalletAccount({ index, source: SEED_SRC, seedId })

      const { seedSigner } = await setup()

      const signedMessage = await seedSigner.signMessage({
        baseAssetName: 'bitcoin',
        walletAccount,
        message: {
          bip322Message: {
            message: Buffer.from(messageToSign, 'utf8'),
            address: fixtures.bitcoin.NativeSegWitAddresses[index],
          },
        },
      })

      expect(signedMessage.toString('hex')).toEqual(fixtures.bitcoin.ECDSAsignatures[index])
    }
  })

  it('signs a message with the signer (Solana)', async () => {
    for (const index of PORTFOLIO_INDEXES) {
      const messageToSign = 'hello world'
      const { seedSigner } = await setup()
      const walletAccount = new WalletAccount({ index, source: SEED_SRC, seedId })

      const signedMessage = await seedSigner.signMessage({
        baseAssetName: 'solana',
        walletAccount,
        message: {
          rawMessage: Buffer.from(messageToSign, 'utf8'),
        },
      })

      expect(signedMessage.toString('hex')).toEqual(fixtures.solana.signaturesForRawMessages[index])
    }
  })

  it('signs a message with the signer (Cardano)', async () => {
    for (const index of PORTFOLIO_INDEXES) {
      const messageToSign = 'hello world'
      const { seedSigner } = await setup()
      const walletAccount = new WalletAccount({ index, source: SEED_SRC, seedId })

      const { signature, key } = await seedSigner.signMessage({
        baseAssetName: 'cardano',
        walletAccount,
        message: {
          cip30Message: {
            address: fixtures.cardano.addresses[index],
            payload: Buffer.from(messageToSign, 'utf8'),
          },
        },
      })

      expect(signature.toString('hex')).toEqual(fixtures.cardano.signatures[index])
      expect(key.toString('hex')).toEqual(fixtures.cardano.keys[index])
    }
  })

  it('signs a message with the signer (Algorand)', async () => {
    for (const index of PORTFOLIO_INDEXES) {
      const messageToSign = 'hello world'
      const { seedSigner } = await setup()
      const walletAccount = new WalletAccount({ index, source: SEED_SRC, seedId })

      const signedMessage = await seedSigner.signMessage({
        baseAssetName: 'algorand',
        walletAccount,
        message: {
          rawMessage: Buffer.from(messageToSign, 'utf8'),
        },
      })

      expect(signedMessage.toString('hex')).toEqual(
        fixtures.algorand.signaturesForRawMessages[index]
      )
    }
  })
})
