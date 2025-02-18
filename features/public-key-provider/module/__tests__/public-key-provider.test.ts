import { type Atom, createInMemoryAtom } from '@exodus/atoms'
import BIP32 from '@exodus/bip32'
import { createAsset as createBitcoin } from '@exodus/bitcoin-plugin'
import KeyIdentifier from '@exodus/key-identifier'
import { Keychain } from '@exodus/keychain/module'
import { getSeedId } from '@exodus/keychain/module/crypto/seed-id'
import { createNoopLogger, type Logger } from '@exodus/logger'
import { WalletAccount } from '@exodus/models'
import { mnemonicToSeedSync } from 'bip39'
import { when } from 'jest-when'

import type { GetBuildMetadata, PublicKeyProvider } from '../public-key-provider.js'
import publicKeyProviderDefinition from '../public-key-provider.js'
import type { IPublicKeyStore } from '../store/types.js'

const bitcoin = createBitcoin({ assetClientInterface: { createLogger: createNoopLogger } })
const logger = { warn: jest.fn(), debug: jest.fn() } as unknown as Logger

describe('PublicKeyProvider', () => {
  const seed = mnemonicToSeedSync(
    'menu memory fury language physical wonder dog valid smart edge decrease worth'
  )
  const seedId = getSeedId(seed)
  const xpub =
    'xpub6C7J9BSRbgyMtjVG244dKHAPweZGuowQRExT9xDhgDpW65Ki92DV3RL2VLMFSqUcPs5G7Ti8nucmBNagY6a9cu9w7ooLt5EtYDi29CM9Xi1'

  let publicKeyProvider: PublicKeyProvider
  let publicKeyStore: IPublicKeyStore
  let getBuildMetadata: GetBuildMetadata
  let keychain: Keychain
  let walletAccountsAtom: Atom<{
    [name: string]: WalletAccount
  }>

  const keyIdentifier = bitcoin.api.getKeyIdentifier({
    purpose: 44,
    accountIndex: 0,
    addressIndex: 1,
    chainIndex: 0,
  })

  const buildPublicKeyProvider = (overrides = {}) => {
    publicKeyProvider = publicKeyProviderDefinition.factory({
      publicKeyStore,
      keychain,
      walletAccountsAtom,
      logger,
      getBuildMetadata,
      ...overrides,
    })
  }

  beforeEach(() => {
    getBuildMetadata = jest.fn().mockResolvedValue({ dev: true })
    publicKeyStore = { get: jest.fn(), add: jest.fn() } as unknown as IPublicKeyStore
    keychain = new Keychain({})
    keychain.addSeed(seed)

    walletAccountsAtom = createInMemoryAtom()
    buildPublicKeyProvider()
  })

  describe('cache', () => {
    test('gets public key from key store', async () => {
      const walletAccount = new WalletAccount({
        ...WalletAccount.DEFAULT,
      })

      await walletAccountsAtom.set({ [walletAccount.toString()]: walletAccount })

      const publicKey = Buffer.from('my pub key')
      const xpub = 'my xpub'

      when(publicKeyStore.get)
        .calledWith({
          walletAccountName: walletAccount.toString(),
          keyIdentifier: expect.objectContaining(keyIdentifier),
        })
        .mockResolvedValue({ publicKey, xpub })

      await expect(
        publicKeyProvider.getPublicKey({
          walletAccount: walletAccount.toString(),
          keyIdentifier,
        })
      ).resolves.toEqual(publicKey)

      await expect(
        publicKeyProvider.getExtendedPublicKey({
          walletAccount: walletAccount.toString(),
          keyIdentifier,
        })
      ).resolves.toEqual(xpub)
    })

    test('derives missing pubkey from xpub', async () => {
      const walletAccount = new WalletAccount({
        ...WalletAccount.DEFAULT,
      })

      await walletAccountsAtom.set({ [walletAccount.toString()]: walletAccount })

      const xpubKeyIdentifier = new KeyIdentifier({
        ...keyIdentifier,
        derivationPath: "m/44'/0'/0'",
      })

      when(publicKeyStore.get)
        .calledWith({
          walletAccountName: walletAccount.toString(),
          keyIdentifier,
        })
        .mockResolvedValue(null)

      when(publicKeyStore.get)
        .calledWith({
          walletAccountName: walletAccount.toString(),
          keyIdentifier: xpubKeyIdentifier,
        })
        .mockResolvedValue({
          xpub,
        })

      await expect(
        publicKeyProvider.getPublicKey({
          walletAccount: walletAccount.toString(),
          keyIdentifier,
        })
      ).resolves.toEqual(Buffer.from('Am9vtEBXDSIm7FQtOfysnH4CFxmxXo5Ul3Xt38diK0QO', 'base64'))

      await expect(
        publicKeyProvider.getExtendedPublicKey({
          walletAccount: walletAccount.toString(),
          keyIdentifier,
        })
      ).resolves.toBe(BIP32.fromXPub(xpub).derive('m/0/1').xPub)
    })
  })

  describe('software wallets', () => {
    test('always rederives on prod', async () => {
      buildPublicKeyProvider({ getBuildMetadata: jest.fn().mockResolvedValue({ dev: false }) })
      const walletAccount = new WalletAccount({
        ...WalletAccount.DEFAULT,
        seedId,
      })

      await walletAccountsAtom.set({ [walletAccount.toString()]: walletAccount })
      await publicKeyProvider.getPublicKey({
        walletAccount: walletAccount.toString(),
        keyIdentifier,
      })

      await publicKeyProvider.getExtendedPublicKey({
        walletAccount: walletAccount.toString(),
        keyIdentifier,
      })

      expect(publicKeyStore.get).not.toHaveBeenCalled()
    })

    test('exports xpub from exodus wallet account', async () => {
      const walletAccount = new WalletAccount({ ...WalletAccount.DEFAULT, seedId })
      await walletAccountsAtom.set({ [walletAccount.toString()]: walletAccount })

      const xpub = await publicKeyProvider.getExtendedPublicKey({
        walletAccount: walletAccount.toString(),
        keyIdentifier,
      })

      expect(xpub).toBe(
        'xpub6GDQtsJmgat9QCFSLDe8QRaumBzPT3wNkaHC3EtNbMSr5gkC4BJoFVx1dByTtbzPskZEr2UpEgEvkAKnRUvwxwejwkeoNmJPg89CKfdBG1D'
      )
    })

    test('caches xpub on keystore upon reading', async () => {
      const walletAccount = new WalletAccount({ ...WalletAccount.DEFAULT, seedId })
      await walletAccountsAtom.set({ [walletAccount.toString()]: walletAccount })

      const xpub = await publicKeyProvider.getExtendedPublicKey({
        walletAccount: walletAccount.toString(),
        keyIdentifier,
      })

      expect(publicKeyStore.add).toHaveReturnedTimes(1)
      expect(publicKeyStore.add).toHaveBeenCalledWith(
        expect.objectContaining({
          xpub,
        })
      )
    })

    test('exports public key from exodus wallet account', async () => {
      const walletAccount = new WalletAccount({ ...WalletAccount.DEFAULT, seedId })
      await walletAccountsAtom.set({ [walletAccount.toString()]: walletAccount })

      const publicKey = await publicKeyProvider.getPublicKey({
        walletAccount: walletAccount.toString(),
        keyIdentifier,
      })

      // eslint-disable-next-line sonarjs/no-base-to-string
      expect(publicKey!.toString('hex')).toBe(
        '02b0681b906bdb21cc9ef138491b99ab11721fed0757d8375e98724a5154475390'
      )
    })

    test('caches publicKey on keystore upon reading', async () => {
      const walletAccount = new WalletAccount({ ...WalletAccount.DEFAULT, seedId })
      await walletAccountsAtom.set({ [walletAccount.toString()]: walletAccount })

      const publicKey = await publicKeyProvider.getPublicKey({
        walletAccount: walletAccount.toString(),
        keyIdentifier,
      })

      expect(publicKeyStore.add).toHaveReturnedTimes(1)
      expect(publicKeyStore.add).toHaveBeenCalledWith(
        expect.objectContaining({
          publicKey,
        })
      )
    })

    test('exports xpub from seed wallet account', async () => {
      const walletAccount = new WalletAccount({ ...WalletAccount.DEFAULT, source: 'seed', seedId })
      await walletAccountsAtom.set({ [walletAccount.toString()]: walletAccount })

      const xpub = await publicKeyProvider.getExtendedPublicKey({
        walletAccount: walletAccount.toString(),
        keyIdentifier,
      })

      expect(xpub).toBe(
        'xpub6GDQtsJmgat9QCFSLDe8QRaumBzPT3wNkaHC3EtNbMSr5gkC4BJoFVx1dByTtbzPskZEr2UpEgEvkAKnRUvwxwejwkeoNmJPg89CKfdBG1D'
      )
    })

    test('exports public key from seed wallet account', async () => {
      const walletAccount = new WalletAccount({ ...WalletAccount.DEFAULT, source: 'seed', seedId })
      await walletAccountsAtom.set({ [walletAccount.toString()]: walletAccount })

      const publicKey = await publicKeyProvider.getPublicKey({
        walletAccount: walletAccount.toString(),
        keyIdentifier,
      })

      // eslint-disable-next-line sonarjs/no-base-to-string
      expect(publicKey!.toString('hex')).toBe(
        '02b0681b906bdb21cc9ef138491b99ab11721fed0757d8375e98724a5154475390'
      )
    })

    test('support walletAccount instance for backwards compat', async () => {
      const walletAccount = new WalletAccount({ ...WalletAccount.DEFAULT, source: 'seed', seedId })
      await walletAccountsAtom.set({ [walletAccount.toString()]: walletAccount })

      const publicKey = await publicKeyProvider.getPublicKey({
        // @ts-expect-error testing backwards compat
        walletAccount,
        keyIdentifier,
      })

      // eslint-disable-next-line sonarjs/no-base-to-string
      expect(publicKey!.toString('hex')).toBe(
        '02b0681b906bdb21cc9ef138491b99ab11721fed0757d8375e98724a5154475390'
      )
    })
  })

  describe('hardware wallets', () => {
    test('always use the store, even in prod', async () => {
      buildPublicKeyProvider({ getBuildMetadata: jest.fn().mockResolvedValue({ dev: false }) })

      const walletAccount = new WalletAccount({
        ...WalletAccount.DEFAULT,
        id: 'wayne',
        source: WalletAccount.TREZOR_SRC,
      })

      await walletAccountsAtom.set({ [walletAccount.toString()]: walletAccount })

      const publicKey = Buffer.from('my pub key')
      const xpub = 'my xpub'

      when(publicKeyStore.get)
        .calledWith({
          walletAccountName: walletAccount.toString(),
          keyIdentifier: expect.objectContaining(keyIdentifier),
        })
        .mockResolvedValue({ publicKey, xpub })

      await publicKeyProvider.getPublicKey({
        walletAccount: walletAccount.toString(),
        keyIdentifier,
      })

      await publicKeyProvider.getExtendedPublicKey({
        walletAccount: walletAccount.toString(),
        keyIdentifier,
      })

      expect(publicKeyStore.get).toHaveBeenCalledTimes(2)
    })

    test('throws when no pubkey', async () => {
      const walletAccount = new WalletAccount({
        ...WalletAccount.DEFAULT,
        id: 'wayne',
        source: WalletAccount.TREZOR_SRC,
      })
      await walletAccountsAtom.set({ [walletAccount.toString()]: walletAccount })

      when(publicKeyStore.get)
        .calledWith({
          walletAccountName: walletAccount.toString(),
          keyIdentifier,
        })
        .mockResolvedValue(null)

      await expect(
        publicKeyProvider.getPublicKey({
          walletAccount: walletAccount.toString(),
          keyIdentifier,
        })
      ).rejects.toThrow(
        `No public key found for ${walletAccount.toString()} and key identifier ${
          keyIdentifier.derivationPath
        } (${keyIdentifier.derivationAlgorithm})`
      )
    })
  })
})
