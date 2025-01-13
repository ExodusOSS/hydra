import { randomBytes } from '@exodus/crypto/randomBytes'
import assert from 'assert'
import BigInteger from 'bigi'
import ecurve from 'ecurve'
import { HDKey, HARDENED_OFFSET } from '../src/hdkey.js'
import loadFixture from './load-fixture.cjs'

const fixtures = loadFixture('hdkey')
const curve = ecurve.getCurveByName('secp256k1')

describe('hdkey', function () {
  describe('+ fromMasterSeed', function () {
    fixtures.valid.forEach(function (f) {
      it('should properly derive the chain path: ' + f.path, function () {
        const hdkey = HDKey.fromMasterSeed(Buffer.from(f.seed, 'hex'))
        const childkey = hdkey.derive(f.path)

        assert.equal(childkey.privateExtendedKey, f.private)
        assert.equal(childkey.publicExtendedKey, f.public)
      })

      describe('> ' + f.path + ' toJSON()', function () {
        it('should return an object read for JSON serialization', function () {
          const hdkey = HDKey.fromMasterSeed(Buffer.from(f.seed, 'hex'))
          const childkey = hdkey.derive(f.path)

          const obj = {
            xpriv: f.private,
            xpub: f.public,
          }

          assert.deepEqual(childkey.toJSON(), obj)

          const newKey = HDKey.fromExtendedKey(obj.xpriv)
          assert.strictEqual(newKey.privateExtendedKey, f.private)
          assert.strictEqual(newKey.publicExtendedKey, f.public)
        })
      })
    })
  })

  describe('- privateKey', function () {
    it('should throw an error if incorrect key size', function () {
      const hdkey = new HDKey()
      assert.throws(function () {
        hdkey.privateKey = Buffer.from([1, 2, 3, 4])
      }, /Expected an Uint8Array of size 32/)
    })
  })

  describe('- publicKey', function () {
    it('should throw an error if incorrect key size', function () {
      assert.throws(function () {
        const hdkey = new HDKey()
        hdkey.publicKey = Buffer.from([1, 2, 3, 4])
      }, /Invalid public key/)
    })

    it('should not throw if key is 33 bytes (compressed)', function () {
      const priv = randomBytes(32)
      const pub = curve.G.multiply(BigInteger.fromBuffer(priv)).getEncoded(true)
      assert.equal(pub.length, 33)
      const hdkey = new HDKey()
      hdkey.publicKey = pub
    })

    it('should not throw if key is 33 bytes (compressed)', function () {
      const priv = Buffer.from(fixtures.rawHex[0].private, 'hex')
      const pub = curve.G.multiply(BigInteger.fromBuffer(priv)).getEncoded(true)
      assert.equal(pub.length, 33)
      const hdkey = new HDKey()
      hdkey.publicKey = pub
    })

    it('should not throw if key is 65 bytes (not compressed)', function () {
      const priv = randomBytes(32)
      const pub = curve.G.multiply(BigInteger.fromBuffer(priv)).getEncoded(false)
      assert.equal(pub.length, 65)
      const hdkey = new HDKey()
      hdkey.publicKey = pub
    })

    it('should not throw if key is 65 bytes (not compressed)', function () {
      const priv = Buffer.from(fixtures.rawHex[1].private, 'hex')
      const pub = curve.G.multiply(BigInteger.fromBuffer(priv)).getEncoded(false)
      assert.equal(pub.length, 65)
      const hdkey = new HDKey()
      hdkey.publicKey = pub
    })

    fixtures.rawHex.forEach(function (f) {
      it('should convert to correct public key', function () {
        const hdkey = new HDKey()
        hdkey.privateKey = Buffer.from(f.private, 'hex')
        assert.equal(hdkey.publicKey.toString('hex'), f.public)
      })
    })
  })

  describe('+ fromExtendedKey()', function () {
    describe('> when private', function () {
      it('should parse it', function () {
        // m/0/2147483647'/1/2147483646'/2
        const key =
          'xprvA2nrNbFZABcdryreWet9Ea4LvTJcGsqrMzxHx98MMrotbir7yrKCEXw7nadnHM8Dq38EGfSh6dqA9QWTyefMLEcBYJUuekgW4BYPJcr9E7j'
        const hdkey = HDKey.fromExtendedKey(key)
        assert.equal(hdkey.versions.private, 0x04_88_ad_e4)
        assert.equal(hdkey.versions.public, 0x04_88_b2_1e)
        assert.equal(hdkey.depth, 5)
        assert.equal(hdkey.parentFingerprint, 0x31_a5_07_b8)
        assert.equal(hdkey.index, 2)
        assert.equal(
          hdkey.chainCode.toString('hex'),
          '9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'
        )
        assert.equal(
          hdkey.privateKey.toString('hex'),
          'bb7d39bdb83ecf58f2fd82b6d918341cbef428661ef01ab97c28a4842125ac23'
        )
        assert.equal(
          hdkey.publicKey.toString('hex'),
          '024d902e1a2fc7a8755ab5b694c575fce742c48d9ff192e63df5193e4c7afe1f9c'
        )
        assert.equal(hdkey.identifier.toString('hex'), '26132fdbe7bf89cbc64cf8dafa3f9f88b8666220')
      })
    })

    describe('> when public', function () {
      it('should parse it', function () {
        // m/0/2147483647'/1/2147483646'/2
        const key =
          'xpub6FnCn6nSzZAw5Tw7cgR9bi15UV96gLZhjDstkXXxvCLsUXBGXPdSnLFbdpq8p9HmGsApME5hQTZ3emM2rnY5agb9rXpVGyy3bdW6EEgAtqt'
        const hdkey = HDKey.fromExtendedKey(key)
        assert.equal(hdkey.versions.private, 0x04_88_ad_e4)
        assert.equal(hdkey.versions.public, 0x04_88_b2_1e)
        assert.equal(hdkey.depth, 5)
        assert.equal(hdkey.parentFingerprint, 0x31_a5_07_b8)
        assert.equal(hdkey.index, 2)
        assert.equal(
          hdkey.chainCode.toString('hex'),
          '9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'
        )
        assert.equal(hdkey.privateKey, null)
        assert.equal(
          hdkey.publicKey.toString('hex'),
          '024d902e1a2fc7a8755ab5b694c575fce742c48d9ff192e63df5193e4c7afe1f9c'
        )
        assert.equal(hdkey.identifier.toString('hex'), '26132fdbe7bf89cbc64cf8dafa3f9f88b8666220')
      })

      it('should parse it without verification', function () {
        // m/0/2147483647'/1/2147483646'/2
        const key =
          'xpub6FnCn6nSzZAw5Tw7cgR9bi15UV96gLZhjDstkXXxvCLsUXBGXPdSnLFbdpq8p9HmGsApME5hQTZ3emM2rnY5agb9rXpVGyy3bdW6EEgAtqt'
        const hdkey = HDKey.fromExtendedKey(key, null, false)
        assert.equal(hdkey.versions.private, 0x04_88_ad_e4)
        assert.equal(hdkey.versions.public, 0x04_88_b2_1e)
        assert.equal(hdkey.depth, 5)
        assert.equal(hdkey.parentFingerprint, 0x31_a5_07_b8)
        assert.equal(hdkey.index, 2)
        assert.equal(
          hdkey.chainCode.toString('hex'),
          '9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'
        )
        assert.equal(hdkey.privateKey, null)
        assert.equal(
          hdkey.publicKey.toString('hex'),
          '024d902e1a2fc7a8755ab5b694c575fce742c48d9ff192e63df5193e4c7afe1f9c'
        )
        assert.equal(hdkey.identifier.toString('hex'), '26132fdbe7bf89cbc64cf8dafa3f9f88b8666220')
      })
    })
  })

  describe('> when deriving public key', function () {
    it('should work', function () {
      const key =
        'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8'
      const hdkey = HDKey.fromExtendedKey(key)

      const path = 'm/3353535/2223/0/99424/4/33'
      const derivedHDKey = hdkey.derive(path)

      const expected =
        'xpub6JdKdVJtdx6sC3nh87pDvnGhotXuU5Kz6Qy7Piy84vUAwWSYShsUGULE8u6gCivTHgz7cCKJHiXaaMeieB4YnoFVAsNgHHKXJ2mN6jCMbH1'
      assert.equal(derivedHDKey.publicExtendedKey, expected)
    })
  })

  describe('> when private key integer is less than 32 bytes', function () {
    it('should work', function () {
      const seed = '000102030405060708090a0b0c0d0e0f'
      const masterKey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'))

      const newKey = masterKey.derive("m/44'/6'/4'")
      const expected =
        'xprv9ymoag6W7cR6KBcJzhCM6qqTrb3rRVVwXKzwNqp1tDWcwierEv3BA9if3ARHMhMPh9u2jNoutcgpUBLMfq3kADDo7LzfoCnhhXMRGX3PXDx'
      assert.equal(newKey.privateExtendedKey, expected)
    })
  })

  describe('HARDENED_OFFSET', function () {
    it('should be set', function () {
      assert(HARDENED_OFFSET)
    })
  })

  describe('> when private key has leading zeros', function () {
    it('will include leading zeros when hashing to derive child', function () {
      const key =
        'xprv9s21ZrQH143K3ckY9DgU79uMTJkQRLdbCCVDh81SnxTgPzLLGax6uHeBULTtaEtcAvKjXfT7ZWtHzKjTpujMkUd9dDb8msDeAfnJxrgAYhr'
      const hdkey = HDKey.fromExtendedKey(key)
      assert.equal(
        hdkey.privateKey.toString('hex'),
        '00000055378cf5fafb56c711c674143f9b0ee82ab0ba2924f19b64f5ae7cdbfd'
      )
      const derived = hdkey.derive("m/44'/0'/0'/0/0'")
      assert.equal(
        derived.privateKey.toString('hex'),
        '3348069561d2a0fb925e74bf198762acc47dce7db27372257d2d959a9e6f8aeb'
      )
    })
  })

  describe('> when private key is null', function () {
    it('privateExtendedKey should return null and not throw', function () {
      const seed = '000102030405060708090a0b0c0d0e0f'
      const masterKey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'))

      assert.ok(masterKey.privateExtendedKey, 'xpriv is truthy')
      assert.notEqual(masterKey.privateKey, null, 'privateKey is not null before wipe')
      masterKey.wipePrivateData()
      assert.equal(masterKey.privateKey, null, 'privateKey is null after wipe')

      assert.doesNotThrow(function () {
        masterKey.privateExtendedKey // eslint-disable-line no-unused-expressions
      })

      assert.ok(!masterKey.privateExtendedKey, 'xpriv is falsy')
    })
  })

  describe(' - when the path given to derive contains only the master extended key', function () {
    const hdKeyInstance = HDKey.fromMasterSeed(Buffer.from(fixtures.valid[0].seed, 'hex'))

    it('should return the same hdkey instance', function () {
      assert.equal(hdKeyInstance.derive('m'), hdKeyInstance)
      assert.equal(hdKeyInstance.derive('M'), hdKeyInstance)
      assert.equal(hdKeyInstance.derive("m'"), hdKeyInstance)
      assert.equal(hdKeyInstance.derive("M'"), hdKeyInstance)
    })
  })

  describe(' - when the path given to derive does not begin with master extended key', function () {
    it('should throw an error', function () {
      assert.throws(function () {
        HDKey.prototype.derive('123')
      }, /Path must start with "m" or "M"/)
    })
  })

  describe('- after wipePrivateData()', function () {
    it('should not have private data', function () {
      const hdkey = HDKey.fromMasterSeed(
        Buffer.from(fixtures.valid[6].seed, 'hex')
      ).wipePrivateData()
      assert.equal(hdkey.privateKey, null)
      assert.equal(hdkey.privateExtendedKey, null)
      const childKey = hdkey.derive('m/0')
      assert.equal(childKey.publicExtendedKey, fixtures.valid[7].public)
      assert.equal(childKey.privateKey, null)
      assert.equal(childKey.privateExtendedKey, null)
    })

    it('should have correct data', function () {
      // m/0/2147483647'/1/2147483646'/2
      const key =
        'xprvA2nrNbFZABcdryreWet9Ea4LvTJcGsqrMzxHx98MMrotbir7yrKCEXw7nadnHM8Dq38EGfSh6dqA9QWTyefMLEcBYJUuekgW4BYPJcr9E7j'
      const hdkey = HDKey.fromExtendedKey(key).wipePrivateData()
      assert.equal(hdkey.versions.private, 0x04_88_ad_e4)
      assert.equal(hdkey.versions.public, 0x04_88_b2_1e)
      assert.equal(hdkey.depth, 5)
      assert.equal(hdkey.parentFingerprint, 0x31_a5_07_b8)
      assert.equal(hdkey.index, 2)
      assert.equal(
        hdkey.chainCode.toString('hex'),
        '9452b549be8cea3ecb7a84bec10dcfd94afe4d129ebfd3b3cb58eedf394ed271'
      )
      assert.equal(
        hdkey.publicKey.toString('hex'),
        '024d902e1a2fc7a8755ab5b694c575fce742c48d9ff192e63df5193e4c7afe1f9c'
      )
      assert.equal(hdkey.identifier.toString('hex'), '26132fdbe7bf89cbc64cf8dafa3f9f88b8666220')
    })

    it('should not throw if called on hdkey without private data', function () {
      const hdkey = HDKey.fromExtendedKey(fixtures.valid[0].public)
      assert.doesNotThrow(() => hdkey.wipePrivateData())
      assert.equal(hdkey.publicExtendedKey, fixtures.valid[0].public)
    })
  })

  describe('Deriving a child key does not mutate the internal state', function () {
    it('should not mutate it when deriving with a private key', function () {
      const hdkey = HDKey.fromExtendedKey(fixtures.valid[0].private)
      const path = 'm/123'
      const privateKeyBefore = hdkey.privateKey.toString('hex')

      const child = hdkey.derive(path)
      assert.equal(hdkey.privateKey.toString('hex'), privateKeyBefore)

      const child2 = hdkey.derive(path)
      assert.equal(hdkey.privateKey.toString('hex'), privateKeyBefore)

      const child3 = hdkey.derive(path)
      assert.equal(hdkey.privateKey.toString('hex'), privateKeyBefore)

      assert.equal(child.privateKey.toString('hex'), child2.privateKey.toString('hex'))
      assert.equal(child2.privateKey.toString('hex'), child3.privateKey.toString('hex'))
    })

    it('should not mutate it when deriving without a private key', function () {
      const hdkey = HDKey.fromExtendedKey(fixtures.valid[0].private)
      const path = 'm/123/123/123'
      hdkey.wipePrivateData()

      const publicKeyBefore = hdkey.publicKey.toString('hex')

      const child = hdkey.derive(path)
      assert.equal(hdkey.publicKey.toString('hex'), publicKeyBefore)

      const child2 = hdkey.derive(path)
      assert.equal(hdkey.publicKey.toString('hex'), publicKeyBefore)

      const child3 = hdkey.derive(path)
      assert.equal(hdkey.publicKey.toString('hex'), publicKeyBefore)

      assert.equal(child.publicKey.toString('hex'), child2.publicKey.toString('hex'))
      assert.equal(child2.publicKey.toString('hex'), child3.publicKey.toString('hex'))
    })
  })
})
