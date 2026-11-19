import { utf8fromString } from '@exodus/bytes/utf8.js'
import { randomBytes } from '@exodus/crypto/randomBytes'
import test from '@exodus/test/tape'
import { blob, metadata } from 'secure-container'

test('encrypt / decrypt ', async (t) => {
  const blobKey = randomBytes(32)
  const message = 'we will attack at dawn!'
  const md = metadata.create()

  // Works on Buffer, Uint8Array
  for (const data of [Buffer.from(message), utf8fromString(message)]) {
    const { blobKey: newBlobKey, blob: secretBlob } = await blob.encrypt(data, md, blobKey)
    t.deepEqual(newBlobKey, blobKey, 'keys are the same')

    const actualMessage = await blob.decrypt(secretBlob, md, blobKey) // returns Buffer
    t.is(actualMessage.toString('utf8'), message, 'secret messages are the same')
  }

  t.end()
})
