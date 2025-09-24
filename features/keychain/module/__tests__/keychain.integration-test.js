import { mnemonicToSeed } from '@exodus/bip39'
import { getShelleyAddress as getCardanoAddress } from '@exodus/cardano-lib'
import { encodePublic as encodePublicEthereum } from '@exodus/ethereum-lib'
import KeyIdentifier from '@exodus/key-identifier'
import { EXODUS_KEY_IDS } from '@exodus/key-ids'

import { getSeedId } from '../crypto/seed-id.js'
import keychainDefinition, { Keychain } from '../keychain.js'
import { assets } from './fixtures/assets.js'

const { factory: createMultiSeedKeychain } = keychainDefinition

const seed = await mnemonicToSeed({
  mnemonic: 'menu memory fury language physical wonder dog valid smart edge decrease worth',
})

const secondSeed = await mnemonicToSeed({
  mnemonic: 'wine system mean beyond filter human meat rubber episode wash stomach aunt',
})

const thirdSeed = await mnemonicToSeed({
  mnemonic: 'element input zero deny move siege stable screen catch like alley shoot',
})

const thirdSeedId = getSeedId(thirdSeed)

describe.each([
  // reduce fixtures by switching seeds
  {
    primarySeed: seed,
    secondarySeed: secondSeed,
    ternarySeed: thirdSeed,
    seedId: getSeedId(seed),
  },
  {
    primarySeed: secondSeed,
    secondarySeed: seed,
    ternarySeed: thirdSeed,
    seedId: getSeedId(seed),
  },
  {
    primarySeed: thirdSeed,
    secondarySeed: seed,
    ternarySeed: thirdSeed,
    seedId: getSeedId(seed),
  },
])('multi-seed-keychain', ({ primarySeed, secondarySeed, ternarySeed, seedId }) => {
  let keychain

  it('should construct correctly', () => {
    expect(keychainDefinition.factory()).toBeInstanceOf(Keychain)
  })

  // eslint-disable-next-line jest/prefer-hooks-on-top
  beforeEach(() => {
    keychain = createMultiSeedKeychain()

    keychain.addSeed(primarySeed)
    keychain.addSeed(secondarySeed)
    keychain.addSeed(ternarySeed)
  })

  describe('exportKeys', () => {
    it('should throw if not passed key id', async () => {
      const failures = [Buffer.from('failure'), 'failure', 0, null, undefined, true]
      for (const failure of failures) {
        await expect(keychain.exportKey({ keyId: failure })).rejects.toThrow()
      }
    })

    it('should generate solana addresses', async () => {
      const successes = [
        {
          expected: 'nsn7DmCMsKWGUWcL92XfPKXFbUz7KtFDRa4nnkc3RiF',
          exportOpts: {
            seedId,
            keyId: new KeyIdentifier({
              assetName: 'solana',
              derivationAlgorithm: 'BIP32',
              derivationPath: "m/44'/501'/0'/0/0",
              keyType: 'nacl',
            }),
          },
        },
        {
          expected: '7SmaJ41gFZ1LPsZJfb57npzdCFuqBRmgj3CScjbmkQwA',
          exportOpts: {
            seedId,
            keyId: new KeyIdentifier({
              assetName: 'solana',
              derivationAlgorithm: 'BIP32',
              derivationPath: "m/44'/501'/1'/0/0",
              keyType: 'nacl',
            }),
          },
        },
      ]

      const encodePublic = assets.solana.keys.encodePublic
      for (const { expected, exportOpts } of successes) {
        const key = await keychain.exportKey(exportOpts)
        expect(encodePublic(key.publicKey)).toBe(expected)
      }
    })

    it('should generate ethereum addresses', async () => {
      const fixtures = [
        {
          expected: '0xF3d46F0De925B28fDa1219BbD60F5ae2a0128F9F',
          exportOpts: {
            seedId,
            keyId: new KeyIdentifier({
              derivationAlgorithm: 'BIP32',
              derivationPath: "m/44'/60'/0'/0/0",
              assetName: 'ethereum',
            }),
          },
        },
        {
          expected: '0x55e60F7531a5c701F526f224FCC071EFCf3fFF61',
          exportOpts: {
            seedId,
            keyId: new KeyIdentifier({
              derivationAlgorithm: 'BIP32',
              derivationPath: "m/44'/60'/1'/0/0",
              assetName: 'ethereum',
            }),
          },
        },
        {
          expected: '0x780984e59eDdA8b1f4bB09dc297241f1Ed0Dcc17',
          exportOpts: {
            seedId,
            keyId: new KeyIdentifier({
              derivationAlgorithm: 'BIP32',
              derivationPath: "m/44'/60'/0'/0/1",
              assetName: 'ethereum',
            }),
          },
        },
      ]

      for (const { expected, exportOpts } of fixtures) {
        const key = await keychain.exportKey(exportOpts)
        expect(encodePublicEthereum(key.publicKey)).toBe(expected)
      }
    })

    it('should generate cardano addresses', async () => {
      const fixtures = [
        {
          expected:
            'addr1q8ftlrj30s8f3qks2l5cuv44f5cgflxqym0d0k4q22dusp7jh789zlqwnzpdq4lf3cet2nfssn7vqfk76ld2q55meqrstsxtqg',
          exportOpts: {
            seedId,
            keyId: new KeyIdentifier({
              derivationAlgorithm: 'BIP32',
              derivationPath: "m/44'/1815'/0'/0/0",
              keyType: 'cardanoByron',
              assetName: 'cardano',
            }),
          },
        },
      ]

      for (const { expected, exportOpts } of fixtures) {
        const key = await keychain.exportKey(exportOpts)
        expect(getCardanoAddress(key.publicKey, true)).toBe(expected)
      }
    })

    it('should fail to generate addresses if assetname is not in legacy priv pub', async () => {
      await expect(
        keychain.exportKey({
          seedId,
          keyId: new KeyIdentifier({
            derivationAlgorithm: 'BIP32',
            derivationPath: "m/44'/1815'/0'/0/0",
            keyType: 'legacy',
            assetName: 'UNKNOWN',
          }),
        })
      ).rejects.toThrow('legacyPrivToPub')
    })

    it('should export SLIP10 keys', async () => {
      const key = await keychain.exportKey({
        seedId,
        keyId: EXODUS_KEY_IDS.TELEMETRY,
        exportPrivate: true,
      })

      expect(key).toEqual({
        publicKey: Buffer.from(
          'eeab6c9e861ed9f3a7f7917f6d972032e3e4d7a433eb6bc30f4b488ee13682c7',
          'hex'
        ),
        privateKey: Buffer.from(
          'e53af1d990800f321a31e5540a1e1f28cad3ff5acfe9a6c8b008dacbd04b7029',
          'hex'
        ),
        xpriv: {
          chainCode: '7d9f91fc9625449db2f97ecedca89b287f59057c29d51aac0a60d2c1f920475b',
          key: 'e53af1d990800f321a31e5540a1e1f28cad3ff5acfe9a6c8b008dacbd04b7029',
        },
        xpub: undefined,
      })
    })
  })

  describe('sign', () => {
    const keyId = new KeyIdentifier({
      assetName: 'solana',
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/44'/501'/0'/0/0",
      keyType: 'nacl',
    })

    it('should sign solana tx', async () => {
      const MESSAGE =
        '010001033c8939b872876416b1ba97d04c6a31211e39258a82d0fa45542a1cccc2617d2f2c2e85e395109a73ab754dfdad48d2cdefae040d4653228245df6fe6b6d24f7300000000000000000000000000000000000000000000000000000000000000004f968728ba006a647883abdd1b8eabde24e181c8bb8e769256f9a37e73b8727901020200010c02000000b4ebad0200000000'
      const VALID_SIGNATURE =
        '810cdc7d804dcfab90147e50c40b0afe1f9d01fa6933739032d761f7fca4226389d348d70478560845ae9e90a940ef4173e17690b9d93122aadd56fa56b8b609'

      const result = await keychain.signBuffer({
        seedId: thirdSeedId,
        keyId,
        signatureType: 'ed25519',
        data: Buffer.from(MESSAGE, 'hex'),
      })

      expect(result.toString('hex')).toBe(VALID_SIGNATURE)
    })

    // Tests derivation path parsing in keychain.signTx. Remove this test when we remove keychain.signTx.
    it('should pass through all required hdkeys', async () => {
      const keyIds = [
        new KeyIdentifier({
          assetName: 'solana',
          derivationAlgorithm: 'BIP32',
          derivationPath: "m/44'/0'/0'/0/0",
          keyType: 'secp256k1',
        }),
        new KeyIdentifier({
          assetName: 'solana',
          derivationAlgorithm: 'BIP32',
          derivationPath: "m/84'/0'/0'/0/0",
          keyType: 'secp256k1',
        }),
      ]

      await keychain.signTx({
        seedId,
        keyIds,
        signTxCallback: ({ hdkeys, privateKey }) => {
          expect(privateKey).not.toBeDefined()
          expect(hdkeys[44].privateKey).toBeDefined()
          expect(hdkeys[84].privateKey).toBeDefined()
          return null
        },
        unsignedTx: Object.create(null),
      })
    })
  })

  describe('clone', () => {
    const solanaKeyId = new KeyIdentifier({
      assetName: 'solana',
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/44'/501'/0'/0/0",
      keyType: 'nacl',
    })

    const cardanoKeyId = new KeyIdentifier({
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/44'/1815'/0'/0/0",
      keyType: 'legacy',
      assetName: 'cardano',
    })

    it('should return locked instance', async () => {
      const keychain = createMultiSeedKeychain()
      keychain.addSeed(seed)
      const clone = keychain.clone()

      await expect(
        keychain.exportKey({
          seedId,
          keyId: solanaKeyId,
        })
      ).resolves.toBeTruthy()

      await expect(
        clone.exportKey({
          seedId,
          keyId: solanaKeyId,
        })
      ).rejects.toThrow()
    })

    it('should have parent legacyPrivToPub config', async () => {
      const legacyPrivToPub = { cardano: jest.fn() }

      const keychain = createMultiSeedKeychain({ legacyPrivToPub })

      const clone = keychain.clone()
      clone.addSeed(seed)

      await clone.exportKey({
        seedId,
        keyId: cardanoKeyId,
      })

      expect(legacyPrivToPub.cardano).toBeCalled()
    })
  })
})
