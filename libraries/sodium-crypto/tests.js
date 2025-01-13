const { randomBytes } = require('crypto')
const HDKeySlip10 = require('@exodus/hd-key-slip-10')

module.exports = function runTests (test, sodium) {
  // matches usage
  const deriveSodiumKeys = async (seed, path) => {
    await sodium.ready
    const derived = new HDKeySlip10(seed).derive(path).key
    return sodium.getSodiumKeysFromSeed(derived)
  }

  const testSeed = Buffer.from(
    'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542',
    'hex'
  )

  // from https://github.com/satoshilabs/slips/blob/90e24c9311063dc4f264c9b49528c26afb8c0d44/slip-0010.md
  test('slip-0010 test vector', async t => {
    const keys = await deriveSodiumKeys(testSeed, "m/0'/2147483647'")
    t.equals(Buffer.isBuffer(keys.box.publicKey), true)
    t.equals(Buffer.isBuffer(keys.box.privateKey), true)
    t.equals(Buffer.isBuffer(keys.sign.publicKey), true)
    t.equals(Buffer.isBuffer(keys.sign.privateKey), true)

    t.equals(
      keys.derived.toString('hex'),
      'ea4f5bfe8694d8bb74b7b59404632fd5968b774ed545e810de9c32a4fb4192f4'
    )

    t.end()
  })

  test('encryptSecret/decryptSecret', async t => {
    const keys = await deriveSodiumKeys(
      testSeed.toString('hex'),
      "m/0'/31337'"
    )
    const msg = 'hi'
    const encrypted = await sodium.encryptSecret(msg, keys.secret)
    t.equals(Buffer.isBuffer(encrypted), true)

    const decrypted = await sodium.decryptSecret(encrypted, keys.secret)
    t.equals(Buffer.isBuffer(decrypted), true)
    t.equals(msg, decrypted.toString())
    t.end()
  })

  test('encryptAEAD/decryptAEAD', async t => {
    const key = Buffer.from('317fe0410721f68b14e446f7dec32ed9f0aaa8095661fb7f19e58e184752a15d', 'hex')
    const nonce = Buffer.from('27ebc46b9ce1979100058996', 'hex')
    const msg = 'hi'
    const encrypted = await sodium.encryptAEAD(msg, key, nonce)
    t.equals(Buffer.isBuffer(encrypted), true)

    const decrypted = await sodium.decryptAEAD(encrypted, key, nonce)
    t.equals(Buffer.isBuffer(decrypted), true)
    t.equals(msg, decrypted.toString())
    t.end()
  })

  test('encryptAEAD/decryptAEAD associatedData', async t => {
    const key = Buffer.from('317fe0410721f68b14e446f7dec32ed9f0aaa8095661fb7f19e58e184752a15d', 'hex')
    const nonce = Buffer.from('27ebc46b9ce1979100058996', 'hex')
    const msg = 'hi'
    const associatedData = 'test'
    const encrypted = await sodium.encryptAEAD(msg, key, nonce, associatedData)
    t.equals(Buffer.isBuffer(encrypted), true)

    const decrypted = await sodium.decryptAEAD(encrypted, key, nonce, associatedData)
    t.equals(Buffer.isBuffer(decrypted), true)
    t.equals(msg, decrypted.toString())
    t.end()
  })

  test('encryptBox/decryptBox', async t => {
    const keysFrom = await deriveSodiumKeys(
      testSeed.toString('hex'),
      "m/0'/31337'"
    )
    const keysTo = await deriveSodiumKeys(
      testSeed.toString('hex'),
      "m/0'/31338'"
    )
    const msg = 'hi'
    const encrypted = await sodium.encryptBox(
      msg,
      keysTo.box.publicKey,
      keysFrom.box.privateKey
    )
    t.equals(Buffer.isBuffer(encrypted), true)

    const decrypted = await sodium.decryptBox(
      encrypted,
      keysFrom.box.publicKey,
      keysTo.box.privateKey
    )

    t.equals(Buffer.isBuffer(decrypted), true)
    t.equals(msg, decrypted.toString())
    t.end()
  })

  test('genBoxKeyPair', async t => {
    const { curve, publicKey, privateKey } = await sodium.genBoxKeyPair(
      randomBytes(32)
    )
    t.equals(curve, 'x25519')

    const msg = 'hi'
    const encrypted = await sodium.encryptBox(msg, publicKey, privateKey)
    const decrypted = await sodium.decryptBox(encrypted, publicKey, privateKey)

    t.equals(msg, Buffer.from(decrypted).toString())
    t.end()
  })

  test('encryptSealedBox/decryptSealedBox', async t => {
    const keysTo = await deriveSodiumKeys(
      testSeed.toString('hex'),
      "m/0'/12345'"
    )
    const msg = 'hello yes this is dog'
    const encrypted = await sodium.encryptSealedBox(
      msg,
      keysTo.box.publicKey
    )
    t.equals(Buffer.isBuffer(encrypted), true)

    const decrypted = await sodium.decryptSealedBox(
      encrypted,
      keysTo.box.publicKey,
      keysTo.box.privateKey
    )

    t.equals(Buffer.isBuffer(decrypted), true)
    t.equals(msg, decrypted.toString())
    t.end()
  })

  test('convertPublicKeyToX25519/convertPrivateKeyToX25519', async t => {
    const keysFrom = await deriveSodiumKeys(
      testSeed.toString('hex'),
      "m/0'/31337'"
    )
    const keysTo = await deriveSodiumKeys(
      testSeed.toString('hex'),
      "m/0'/31338'"
    )
    const fromPk = await sodium.convertPublicKeyToX25519(keysFrom.sign.publicKey)
    const fromSk = await sodium.convertPrivateKeyToX25519(keysFrom.sign.privateKey)
    const toPk = await sodium.convertPublicKeyToX25519(keysTo.sign.publicKey)
    const toSk = await sodium.convertPrivateKeyToX25519(keysTo.sign.privateKey)
    const msg = 'hello yes this is dog'
    const encrypted = await sodium.encryptBox(
      msg,
      toPk,
      fromSk
    )
    t.equals(Buffer.isBuffer(encrypted), true)

    const decrypted = await sodium.decryptBox(
      encrypted,
      fromPk,
      toSk
    )

    t.equals(Buffer.isBuffer(decrypted), true)
    t.equals(msg, decrypted.toString())
    t.end()
  })

  test('signDetached/verifyDetached', async t => {
    const keys = await deriveSodiumKeys(
      testSeed.toString('hex'),
      "m/0'/12345'"
    )

    const { privateKey, publicKey } = keys.sign
    const message = Buffer.from('hello yes this is dog')
    const sig = await sodium.signDetached({ message, privateKey })
    t.equals(Buffer.isBuffer(sig), true)

    const verified = await sodium.verifyDetached({ message, sig, publicKey })
    t.equals(verified, true)

    const verifiedWrongMessage = await sodium.verifyDetached({
      message: Buffer.concat([message, Buffer.from('2')]),
      sig,
      publicKey
    })

    t.equals(verifiedWrongMessage, false)

    t.end()
  })

  test('sign/verify', async t => {
    const keys = await deriveSodiumKeys(
      testSeed.toString('hex'),
      "m/0'/12345'"
    )

    const { privateKey, publicKey } = keys.sign
    const message = Buffer.from('hello yes this is dog')
    const signed = await sodium.sign({ message, privateKey })
    t.equals(Buffer.isBuffer(signed), true)

    const opened = await sodium.signOpen({ message, signed, publicKey })
    t.equals(opened.equals(message), true)

    try {
      await sodium.signOpen({
        signed: Buffer.concat([signed, Buffer.from('2')]),
        publicKey
      })

      t.fail('expected an error')
    } catch (err) {
      t.ok(err)
    }

    t.end()
  })

  test('genSignKeyPair', async t => {
    try {
      await sodium.genSignKeyPair(randomBytes(31))
      t.fail('expected input to be validated')
    } catch (err) {
      t.ok(err)
    }

    const { privateKey, publicKey } = await sodium.genSignKeyPair(randomBytes(32))
    t.equals(Buffer.isBuffer(privateKey), true)
    t.equals(privateKey.length, 64)
    t.equals(Buffer.isBuffer(publicKey), true)
    t.equals(publicKey.length, 32)
    t.end()
  })

  test('pwhash', async t => {
    const data = Buffer.from('marks-ssn-000-123-1111')
    const salt = Buffer.from('bd930975f6a141668a36085b8604631a', 'hex')
    try {
      const hash = await sodium.pwhash({ data, salt })
      t.equals(hash.toString('hex'), 'bb637716acf3ecc2bf4b00d9a7d7749b69946b9ea8eaf182e5a1ecf59eba2e6e')
    } catch (err) {
      t.error(err)
    }
    t.end()
  })
}
