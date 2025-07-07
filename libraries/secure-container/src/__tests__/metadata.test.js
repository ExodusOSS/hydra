import { randomBytes } from '@exodus/crypto/randomBytes'
import test from '@exodus/test/tape'
import { metadata } from 'secure-container' // eslint-disable-line import/no-extraneous-dependencies

import { IV_LEN_BYTES } from '../crypto.js'

test('encode / decode metadata', (t) => {
  t.plan(1)

  const obj = {
    scrypt: {
      salt: randomBytes(32),
      n: 16_384,
      r: 8,
      p: 1,
    },
    cipher: 'aes-256-gcm',
    blobKey: {
      iv: randomBytes(IV_LEN_BYTES),
      authTag: Buffer.alloc(16),
      key: Buffer.alloc(32),
    },
    blob: {
      iv: randomBytes(IV_LEN_BYTES),
      authTag: Buffer.alloc(16),
    },
  }

  const obj2 = metadata.decode(metadata.encode(obj))
  t.deepEqual(obj2, obj, 'verify objects are the same')

  t.end()
})

test('encryptBlobKey / decryptBlobKey ', async (t) => {
  t.plan(2)

  const blobKey = randomBytes(32)
  const passphrase = 'open sesame!'
  const md = metadata.create()

  await t.doesNotReject(() => metadata.encryptBlobKey(md, passphrase, blobKey))
  const actualBlobKey = await metadata.decryptBlobKey(md, passphrase)

  t.deepEqual(actualBlobKey, blobKey, 'blob keys are the same')

  t.end()
})
