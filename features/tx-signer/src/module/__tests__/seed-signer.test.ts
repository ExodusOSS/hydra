import assetSourcesModuleDefinition from '@exodus/asset-sources/lib/module'
import { connectAssets } from '@exodus/assets'
import { createInMemoryAtom } from '@exodus/atoms'
import { mapValues } from '@exodus/basic-utils'
import * as bitcoinPlugin from '@exodus/bitcoin-plugin'
import { getSeedId } from '@exodus/key-utils'
import keychainDefinition, { KeyIdentifier } from '@exodus/keychain/module'
import { WalletAccount } from '@exodus/models'
import { EXODUS_SRC, SEED_SRC } from '@exodus/models/lib/wallet-account'
import * as solanaPluginCJS from '@exodus/solana-plugin'
import { mnemonicToSeedSync } from 'bip39'

import seedSignerDefinition from '../seed-signer.js'

const bufferToSign = Buffer.from(
  '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
  'hex'
)

const dummyExtraEntropy = Buffer.from(
  'b842fe12f92302dc2527d5c3542961a812268da09841dc78515a4c05269d861b',
  'hex'
)

// solana-plugin is _special_
// one .default comes from the fact that it's cjs and everything is wrapped, as cjs has only a default export
// one .default is a manual wrapper for some reason:
// https://github.com/ExodusMovement/assets/blob/ea7df653b8fa8a79bce2d643fb30706e3d5af8ab/solana/solana-plugin/src/index.js#L10-L12
// TODO: remove this when solana-plugin is converted to ESM
const solanaPlugin = solanaPluginCJS.default?.default || solanaPluginCJS.default || solanaPluginCJS

const seedWalletAccount = new WalletAccount({
  index: 1,
  source: SEED_SRC,
  seedId: 'wayne-enterprises',
})

const mnemonic = 'menu memory fury language physical wonder dog valid smart edge decrease worth'
const seed = mnemonicToSeedSync(mnemonic)
const seedId = getSeedId(seed)
const phantomWalletAccount = new WalletAccount({
  index: 1,
  compatibilityMode: 'phantom',
  source: EXODUS_SRC,
  seedId,
})

const defaultWalletAccount = new WalletAccount({
  ...WalletAccount.DEFAULT,
  seedId,
})

const walletAccounts = {
  [WalletAccount.DEFAULT_NAME]: defaultWalletAccount,
  [seedWalletAccount.toString()]: seedWalletAccount,
  [phantomWalletAccount.toString()]: phantomWalletAccount,
}

const walletAccountsAtom = createInMemoryAtom({ defaultValue: walletAccounts })

afterEach(() => {
  jest.resetAllMocks()
})

describe('SeedBasedTransactionSigner', () => {
  const setup = ({ rpcSigning = false, signWithSigner = false } = {}) => {
    const assetClientInterface = { createLogger: () => console }
    const bitcoin = bitcoinPlugin.createAsset({ assetClientInterface })
    const solana = solanaPlugin.createAsset({ assetClientInterface })

    bitcoin.api.features.signWithSigner = signWithSigner
    solana.api.features.signWithSigner = signWithSigner

    const assets = connectAssets({
      bitcoin,
      solana,
    })

    const assetsModule = {
      getAsset: (assetName: string) => assets[assetName],
    }

    const assetsAtom = createInMemoryAtom({ defaultValue: { value: assets } })
    const availableAssetNamesByWalletAccountAtom = createInMemoryAtom({
      defaultValue: mapValues(walletAccounts, () => Object.keys(assets)),
    })

    const keychain = keychainDefinition.factory({
      logger: console,
    })

    keychain.addSeed(seed)

    const assetSources = assetSourcesModuleDefinition.factory({
      assetsAtom,
      availableAssetNamesByWalletAccountAtom,
      walletAccountsAtom,
    })

    const seedSigner = seedSignerDefinition.factory({
      assetsModule,
      keychain,
      assetSources,
      walletSdk: rpcSigning ? {} : undefined,
    })

    return {
      seedSigner,
      keychain,
      assets,
    }
  }

  test('signTx validates "data" to be a Uint8Array for all assets', async () => {
    const { seedSigner, assets } = setup({ signWithSigner: true })
    const unsignedTx = { txData: {}, txMeta: {} }
    const walletAccount = walletAccounts[WalletAccount.DEFAULT_NAME]
    for (const assetName of ['bitcoin', 'solana']) {
      jest
        .spyOn(assets[assetName].api, 'signTx')
        .mockImplementationOnce(async ({ signer }: any) => {
          await signer.sign({
            data: 'some string',
          })
        })

      await expect(
        seedSigner.signTransaction({
          walletAccount,
          baseAssetName: assetName,
          unsignedTx,
        })
      ).rejects.toThrow(/Uint8Array/)
    }
  })

  describe('signSchnorr extraEntropy', () => {
    const { seedSigner, assets } = setup({ signWithSigner: true })
    const unsignedTx = { txData: {}, txMeta: {} }
    const walletAccount = defaultWalletAccount
    const keyId = new KeyIdentifier({
      assetName: 'bitcoin',
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/86'/0'/0'/0/0",
      keyType: 'secp256k1',
    })

    const commonSignOpts = {
      data: bufferToSign,
      signatureType: 'schnorr',
      seedId: walletAccount.seedId,
      keyId,
    }

    const signTxOpts = {
      walletAccount,
      baseAssetName: 'bitcoin',
      unsignedTx,
    }

    test('signSchnorr passes through extraEntropy', async () => {
      const { keychain, seedSigner, assets } = setup({ signWithSigner: true })
      jest.spyOn(assets.bitcoin.api, 'signTx').mockImplementationOnce(async ({ signer }: any) => {
        await signer.sign({
          data: bufferToSign,
          signatureType: 'schnorr',
          extraEntropy: dummyExtraEntropy,
        })
      })

      keychain.secp256k1 = {
        signSchnorr: jest.fn(),
      }

      await seedSigner.signTransaction(signTxOpts)

      const { extraEntropy: suppliedEntropy } = keychain.secp256k1.signSchnorr.mock.calls[0][0]
      expect(suppliedEntropy).toEqual(dummyExtraEntropy)
    })

    test('signSchnorr results in different signatures when extraEntropy defaults to random', async () => {
      jest
        .spyOn(assets.bitcoin.api, 'signTx')
        .mockImplementation(async ({ signer }: any) => signer.sign(commonSignOpts))

      const sig1 = await seedSigner.signTransaction(signTxOpts)
      const sig2 = await seedSigner.signTransaction(signTxOpts)
      expect(sig1 instanceof Uint8Array).toBe(true)
      expect(sig2 instanceof Uint8Array).toBe(true)
      expect(Buffer.from(sig1).equals(Buffer.from(sig2))).toBe(false)
    })

    test('signSchnorr signature deterministic for given value of extraEntropy', async () => {
      // with same entropy
      jest.spyOn(assets.bitcoin.api, 'signTx').mockImplementation(async ({ signer }: any) =>
        signer.sign({
          ...commonSignOpts,
          extraEntropy: dummyExtraEntropy,
        })
      )

      const sig3 = await seedSigner.signTransaction(signTxOpts)
      const sig4 = await seedSigner.signTransaction(signTxOpts)
      expect(sig3 instanceof Uint8Array).toBe(true)
      expect(sig4 instanceof Uint8Array).toBe(true)
      expect(Buffer.from(sig3).equals(Buffer.from(sig4))).toBe(true)
    })
  })

  test('signTx validates "data" to be 32 bytes for ECDSA', async () => {
    const { keychain, seedSigner, assets } = setup({ signWithSigner: true })
    const assetSignTx = jest.spyOn(assets.bitcoin.api, 'signTx')
    const unsignedTx = { txData: {}, txMeta: {} }
    const walletAccount = walletAccounts[WalletAccount.DEFAULT_NAME]

    assetSignTx.mockImplementationOnce(async ({ signer }: any) => {
      await signer.sign({
        data: Buffer.from([1, 2, 3]),
      })
    })

    await expect(
      seedSigner.signTransaction({
        walletAccount,
        baseAssetName: 'bitcoin',
        unsignedTx,
      })
    ).rejects.toThrow(/got: 3/)

    keychain.secp256k1 = {
      signBuffer: jest.fn(),
    }

    assetSignTx.mockImplementationOnce(async ({ signer }: any) => {
      await signer.sign({
        data: bufferToSign,
      })
    })

    await expect(
      seedSigner.signTransaction({
        walletAccount,
        baseAssetName: 'bitcoin',
        unsignedTx,
      })
    ).resolves.not.toThrow()

    expect(keychain.secp256k1.signBuffer).toHaveBeenCalled()
  })

  test('proxies calls to keychain for multiple address assets', async () => {
    const { keychain, seedSigner, assets } = setup()
    const signTxSpy = jest.spyOn(keychain, 'signTx').mockResolvedValue('signedTx')
    const unsignedTx = { txData: {}, txMeta: {} }

    await seedSigner.signTransaction({
      walletAccount: new WalletAccount({ index: 1, source: EXODUS_SRC, seedId }),
      baseAssetName: 'bitcoin',
      unsignedTx,
    })

    expect(signTxSpy).toHaveBeenNthCalledWith(1, {
      seedId,
      keyIds: [
        new KeyIdentifier({
          assetName: 'bitcoin',
          derivationAlgorithm: 'BIP32',
          derivationPath: "m/84'/0'/1'",
          keyType: 'secp256k1',
        }),
        new KeyIdentifier({
          assetName: 'bitcoin',
          derivationAlgorithm: 'BIP32',
          derivationPath: "m/86'/0'/1'",
          keyType: 'secp256k1',
        }),
        new KeyIdentifier({
          assetName: 'bitcoin',
          derivationAlgorithm: 'BIP32',
          derivationPath: "m/44'/0'/1'",
          keyType: 'secp256k1',
        }),
      ],
      signTxCallback: assets.bitcoin.api.signTx,
      unsignedTx,
    })
  })

  test('proxies calls to keychain for single address assets', async () => {
    const { keychain, seedSigner, assets } = setup()
    const signTxSpy = jest.spyOn(keychain, 'signTx').mockResolvedValue('signedTx')
    const unsignedTx = { txData: {}, txMeta: {} }

    await seedSigner.signTransaction({
      walletAccount: new WalletAccount({ index: 1, source: EXODUS_SRC, seedId }),
      baseAssetName: 'solana',
      unsignedTx,
    })

    expect(signTxSpy).toHaveBeenNthCalledWith(1, {
      seedId,
      keyIds: [
        new KeyIdentifier({
          assetName: 'solana',
          derivationAlgorithm: 'BIP32',
          derivationPath: "m/44'/501'/1'/0/0",
          keyType: 'nacl',
        }),
      ],
      signTxCallback: assets.solana.api.signTx,
      unsignedTx,
    })
  })

  test('passes baseAssetName to keychain when signing across the wire', async () => {
    const { keychain, seedSigner } = setup({ rpcSigning: true })
    const signTx = jest.spyOn(keychain, 'signTx').mockResolvedValue('signedTx')
    const unsignedTx = { txData: {}, txMeta: {} }

    const baseAssetName = 'solana'
    await seedSigner.signTransaction({
      walletAccount: new WalletAccount({ index: 1, source: EXODUS_SRC, seedId }),
      baseAssetName,
      unsignedTx,
    })

    expect(signTx).toHaveBeenNthCalledWith(1, {
      seedId,
      keyIds: [
        new KeyIdentifier({
          assetName: baseAssetName,
          derivationAlgorithm: 'BIP32',
          derivationPath: "m/44'/501'/1'/0/0",
          keyType: 'nacl',
        }),
      ],
      baseAssetName,
      unsignedTx,
    })
  })

  test('respects compatibilityMode', async () => {
    const { keychain, seedSigner, assets } = setup()
    const signTxSpy = jest.spyOn(keychain, 'signTx').mockResolvedValue('signedTx')
    const unsignedTx = { txData: {}, txMeta: {} }

    await seedSigner.signTransaction({
      walletAccount: phantomWalletAccount,
      baseAssetName: 'solana',
      unsignedTx,
    })

    expect(signTxSpy).toHaveBeenNthCalledWith(1, {
      seedId,
      keyIds: [
        new KeyIdentifier({
          assetName: 'solana',
          derivationAlgorithm: 'SLIP10',
          derivationPath: "m/44'/501'/1'/0'",
        }),
      ],
      signTxCallback: assets.solana.api.signTx,
      unsignedTx,
    })
  })

  test('respects seed id on wallet account', async () => {
    const { keychain, seedSigner, assets } = setup()
    const signTxSpy = jest.spyOn(keychain, 'signTx').mockResolvedValue('signedTx')
    const unsignedTx = { txData: {}, txMeta: {} }

    await seedSigner.signTransaction({
      walletAccount: seedWalletAccount,
      baseAssetName: 'solana',
      unsignedTx,
    })

    expect(signTxSpy).toHaveBeenNthCalledWith(1, {
      seedId: 'wayne-enterprises',
      keyIds: [
        new KeyIdentifier({
          assetName: 'solana',
          derivationAlgorithm: 'BIP32',
          derivationPath: "m/44'/501'/1'/0/0",
          keyType: 'nacl',
        }),
      ],
      signTxCallback: assets.solana.api.signTx,
      unsignedTx,
    })
  })
})
