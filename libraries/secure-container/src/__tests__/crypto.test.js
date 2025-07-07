import { randomBytes } from '@exodus/crypto/randomBytes'
import test from '@exodus/test/tape'

import * as scCrypto from '../crypto.js'

test('stretchPassphrase should return 32 bytes', async (t) => {
  t.plan(3)

  const passphrase = 'super secret'
  const inputSalt = Buffer.from(
    'b231f5603df27d48457c1f773e673aff1f43f4001786f458e91cceb45d2837e7',
    'hex'
  )

  const scryptParams = { salt: inputSalt, n: 16_384, r: 8, p: 1 }

  const expectedKey = Buffer.from(
    'b451dbfb31c7dc5b45238e1a446a6ad7ae16b9a71235678e9a52089c321ec4cf',
    'hex'
  )
  const { key, salt } = await scCrypto.stretchPassphrase(passphrase, scryptParams)

  t.is(key.toString('hex'), expectedKey.toString('hex'), 'keys are the same')
  t.is(key.byteLength, 32, '32 byte key')
  t.is(salt.toString('hex'), inputSalt.toString('hex'), 'salts are the same')

  t.end()
})

test('stretchPassphrase will accept a buffer passphrase', async (t) => {
  t.plan(2)

  const passphrase = Buffer.from('super secret', 'utf8')
  const salt = Buffer.from(
    'b231f5603df27d48457c1f773e673aff1f43f4001786f458e91cceb45d2837e7',
    'hex'
  )

  const scryptParams = { salt, n: 16_384, r: 8, p: 1 }

  const expectedKey = Buffer.from(
    'b451dbfb31c7dc5b45238e1a446a6ad7ae16b9a71235678e9a52089c321ec4cf',
    'hex'
  )
  const { key } = await scCrypto.stretchPassphrase(passphrase, scryptParams)
  t.is(key.toString('hex'), expectedKey.toString('hex'), 'keys are the same')
  t.is(key.byteLength, 32, '32 byte key')

  t.end()
})

test('aesEncrypt / aesDecrypt', async (t) => {
  t.plan(3)

  const key = randomBytes(32)
  const message = Buffer.from('we will attack at midnight!')

  const { blob, authTag, iv } = await scCrypto.aesEncrypt(key, message)
  t.true(Buffer.isBuffer(iv), 'iv is a buffer')
  t.true(Buffer.isBuffer(authTag), 'authTag is a buffer')

  const decryptedMessage = await scCrypto.aesDecrypt(key, blob, { iv, authTag })

  t.is(decryptedMessage.toString('utf8'), message.toString('utf8'), 'messages are the same')

  t.end()
})

test('boxEncrypt / boxDecrypt', async (t) => {
  t.plan(1)

  const passphrase = 'open sesame'
  const message = Buffer.from('The secret launch code is 1234.')

  const { authTag, blob, iv, salt } = await scCrypto.boxEncrypt(passphrase, message)
  const actualMessage = await scCrypto.boxDecrypt(passphrase, blob, { iv, authTag }, { salt })

  t.is(message.toString('utf8'), actualMessage.toString('utf8'), 'messages are the same')

  t.end()
})

test('createScryptParams', (t) => {
  t.plan(1)

  const params = scCrypto.createScryptParams({ n: 16 })
  t.is(params.n, 16, 'var is set')

  t.end()
})
