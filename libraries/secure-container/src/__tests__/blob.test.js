import { randomBytes } from '@exodus/crypto/randomBytes'
import test from '@exodus/test/tape'
import { blob, metadata } from 'secure-container' // eslint-disable-line import/no-extraneous-dependencies

test('encrypt / decrypt ', async (t) => {
  const blobKey = randomBytes(32)
  const message = 'we will attack at dawn!'
  const md = metadata.create()

  const { blobKey: newBlobKey, blob: secretBlob } = await blob.encrypt(
    Buffer.from(message),
    md,
    blobKey
  )
  t.deepEqual(newBlobKey, blobKey, 'keys are the same')

  const actualMessage = await blob.decrypt(secretBlob, md, blobKey)
  t.is(actualMessage.toString('utf8'), message, 'secret messages are the same')

  t.end()
})
