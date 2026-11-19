import { mnemonicToSeed } from '@exodus/bip39'
import { hash } from '@exodus/crypto/hash'
import KeyIdentifier from '@exodus/key-identifier'

import { getSeedId } from '../../module/crypto/seed-id.js'
import moduleDefinition from '../../module/index.js'
import apiDefinition from '../index.js'

let keychain
const mnemonic = 'cousin access oak tragic entire dynamic marine expand govern enjoy honey tissue'

const seed = await mnemonicToSeed({ mnemonic })
const seedId = await getSeedId(seed)
const solanaKeyId = new KeyIdentifier({
  assetName: 'solana',
  derivationAlgorithm: 'BIP32',
  derivationPath: "m/44'/501'/0'/0/0",
})

// gen fixtures
// import { fromMasterSeed } from '@exodus/bip32'

// const genFixtures = () => {
//   const solanaKey = fromMasterSeed(seed).derive(solanaKeyId.derivationPath)
//   console.log(
//     JSON.stringify(
//       {
//         seedSolanaKey: {
//           ...solanaKey.toJSON(),
//           privateKey: solanaKey.privateKey.toString('hex'),
//           publicKey: solanaKey.publicKey.toString('hex'),
//         },
//       },
//       null,
//       2
//     )
//   )
// }

// genFixtures()

describe('keychain api', () => {
  /** @type {import('../').KeychainApi} */
  let api

  beforeEach(async () => {
    jest.clearAllMocks()

    keychain = moduleDefinition.factory()
    api = apiDefinition.factory({ keychain }).keychain
    await keychain.unlock(seed)
    return api
  })

  test('export privateKey', async () => {
    await expect(
      api.exportKey({ seedId, keyId: solanaKeyId, exportPrivate: true })
    ).resolves.toEqual({
      privateKey: Buffer.from(
        '89e0d7573648f0e08d62491cf8cf01404b198e5316789089845e0f9349f06e21',
        'hex'
      ),
      publicKey: Buffer.from(
        '0379c8ac8ec19111f49630e7d8b3c1cf87ecdb86f2ff9e9fc29269bfc19574bca9',
        'hex'
      ),
      xpriv:
        'xprvA3aSZco2ba6qU2FmVowiad82ZHahVhAo6RA9XX7APo9aCMhaJhEjJxRRAwCB6mojPMJKvuZmG1nKmuLZb2VgZF8WpjNA9QtBgAxnNshT1iN',
      xpub: 'xpub6GZny8KvRwf8gWLEbqUiwm4m7KRBu9teTe5kKuWmx8gZ5A2irEYyrkju2E3bcGXuW9fiqHURsYNuFJrzXQZZ27qTLrD7BWXjZddq4YqrBHp',
    })
  })

  test('export privateKey without publicKey', async () => {
    await expect(
      api.exportKey({ seedId, keyId: solanaKeyId, exportPrivate: true, exportPublic: false })
    ).resolves.toEqual({
      privateKey: Buffer.from(
        '89e0d7573648f0e08d62491cf8cf01404b198e5316789089845e0f9349f06e21',
        'hex'
      ),
      publicKey: null,
      xpriv:
        'xprvA3aSZco2ba6qU2FmVowiad82ZHahVhAo6RA9XX7APo9aCMhaJhEjJxRRAwCB6mojPMJKvuZmG1nKmuLZb2VgZF8WpjNA9QtBgAxnNshT1iN',
      xpub: null,
    })
  })

  test('export publicKey', async () => {
    await expect(api.exportKey({ seedId, keyId: solanaKeyId })).resolves.toEqual({
      privateKey: null,
      publicKey: Buffer.from(
        '0379c8ac8ec19111f49630e7d8b3c1cf87ecdb86f2ff9e9fc29269bfc19574bca9',
        'hex'
      ),
      xpriv: null,
      xpub: 'xpub6GZny8KvRwf8gWLEbqUiwm4m7KRBu9teTe5kKuWmx8gZ5A2irEYyrkju2E3bcGXuW9fiqHURsYNuFJrzXQZZ27qTLrD7BWXjZddq4YqrBHp',
    })
  })

  describe('arePrivateKeysLocked', () => {
    test('returns false when keychain is unlocked', async () => {
      expect(await api.arePrivateKeysLocked()).toBe(false)
    })

    test('returns true after lockPrivateKeys', async () => {
      keychain.lockPrivateKeys()
      expect(await api.arePrivateKeysLocked()).toBe(true)
    })

    test('returns false after lock + unlock', async () => {
      keychain.lockPrivateKeys()
      await keychain.unlockPrivateKeys()
      expect(await api.arePrivateKeysLocked()).toBe(false)
    })
  })

  const EXO = Number.parseInt(Buffer.from('exo').toString('hex'), '16')

  describe('sodium', () => {
    const keyId = new KeyIdentifier({
      derivationAlgorithm: 'BIP32',
      derivationPath: `m/${EXO}'/5'/0'`,
      keyType: 'secp256k1',
    })
    const otherKeyId = new KeyIdentifier({
      derivationAlgorithm: 'BIP32',
      derivationPath: `m/${EXO}'/5'/1'`,
      keyType: 'secp256k1',
    })

    test('should encrypt and decrypt data', async () => {
      const data = Buffer.from("Batman's is Harvey Dent")
      const encrypted = await api.sodium.encryptSecretBox({ seedId, keyId, data })

      expect(encrypted).toBeInstanceOf(Buffer)

      const decrypted = await api.sodium.decryptSecretBox({ seedId, keyId, data: encrypted })
      expect(data.compare(decrypted)).toBe(0)
    })

    test('should encrypt and decrypt data with external keypair', async () => {
      const {
        box: { publicKey: toPublicKey },
      } = await api.sodium.getKeysFromSeed({ seedId, keyId: otherKeyId })

      const data = Buffer.from("Harvey Dent's identity was revealed as the Riddler")
      const encrypted = await api.sodium.encryptBox({ seedId, keyId, data, toPublicKey })

      expect(encrypted).toBeInstanceOf(Buffer)

      const {
        box: { publicKey: fromPublicKey },
      } = await api.sodium.getKeysFromSeed({ seedId, keyId })

      const decrypted = await api.sodium.decryptBox({
        seedId,
        keyId: otherKeyId,
        data: encrypted,
        fromPublicKey,
      })
      expect(data.compare(decrypted)).toBe(0)
    })

    test('sign signs data', async () => {
      const data = Buffer.from("Batman's identity was revealed as Harvey Dent")
      const signed = await api.sodium.sign({ seedId, keyId, data })
      expect(signed.toString('hex')).toBe(
        'f491a1264bd310c3cc0d412d4dcf2ba144cf99659a025d39b73586fcde6c4e103ccf82574a339f6f9410c57409bbb4b2df723b3bbeadc0a4d7ff3630192cb0014261746d616e2773206964656e74697479207761732072657665616c6564206173204861727665792044656e74'
      )
    })

    test('signDetached signs data', async () => {
      const data = Buffer.from("Batman's identity was revealed as Harvey Dent")
      const signature = await api.sodium.signDetached({ seedId, keyId, data })

      expect(signature.toString('hex')).toBe(
        'f491a1264bd310c3cc0d412d4dcf2ba144cf99659a025d39b73586fcde6c4e103ccf82574a339f6f9410c57409bbb4b2df723b3bbeadc0a4d7ff3630192cb001'
      )
    })

    test('getKeysFromSeed returns public keys', async () => {
      const keys = await api.sodium.getKeysFromSeed({ seedId, keyId })

      expect(keys.secret).toBeNull()
      expect(keys.sign.publicKey.toString('hex')).toBe(
        '5960b9980b740a241dea0d44fe304b196484eab1427ee9e7999b5eeff21cdac9'
      )
      expect(keys.box.publicKey.toString('hex')).toBe(
        '9bb8eb0829e1190d84ea231187be3501a48843446f758ec2b39d262c998d6c4b'
      )
    })
  })

  describe('ed25519', () => {
    const keyId = new KeyIdentifier({
      derivationAlgorithm: 'SLIP10',
      derivationPath: `m/${EXO}'/5'/0'`,
      keyType: 'nacl',
    })

    test('signBuffer signs binary data', async () => {
      const data = Buffer.from("Batman's identity was revealed as Harvey Dent")
      const signature = await api.ed25519.signBuffer({ seedId, keyId, data })

      expect(signature.toString('hex')).toBe(
        '5554a24c0885288135f5a4e6bc77b8e84c5e0a836b43b8ea578e3eef890e7d3a4b224d1a9b24960316c626546ff410d1bec918ddb455921c62acbc617c0c2d05'
      )
    })
  })

  describe('secp256k1', () => {
    const keyId = new KeyIdentifier({
      derivationAlgorithm: 'BIP32',
      derivationPath: `m/${EXO}'/5'/0'`,
      keyType: 'secp256k1',
    })

    test('signBuffer signs binary data', async () => {
      const data = await hash('sha256', "Batman's identity was revealed as Harvey Dent")
      const signature = await api.secp256k1.signBuffer({ seedId, keyId, data })

      expect(signature.toString('hex')).toBe(
        '3045022100f3aab0f6b44f62ef387050c86fb79bacabb36b254d3017d83dc801b8e72ad58602202339bf7576cb07eadd82c9ce97d5c117ceeaa3d0b990695ae9f6e7659f535fac'
      )
    })

    test('signSchnorr signs binary data', async () => {
      const data = await hash('sha256', "Batman's identity was revealed as Harvey Dent")
      const signature = await api.secp256k1.signSchnorr({
        seedId,
        keyId,
        data,
        extraEntropy: Buffer.from(
          '1230000000000000000000000000000000000000000000000000000000000000',
          'hex'
        ),
      })
      expect(signature.toString('hex')).toBe(
        'd8a41b022fab008d1d8bc32ce99dd16a4edae37da691047b3729d626c47d6e0850f78245656bc0edccf6002936b96fe04bb4553be5334cf425ac94ca2da33a2e'
      )
    })
  })
})
