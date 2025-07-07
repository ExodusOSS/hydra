import { randomBytes } from '@exodus/crypto/randomBytes'
import test from '@exodus/test/tape'
import { blob as secoBlob, file, header, metadata } from 'secure-container' // eslint-disable-line import/no-extraneous-dependencies

import * as scCrypto from '../crypto.js'

test('usage', async (t) => {
  // t.plan(1)

  // -- ENCRYPTION ---

  const headerObj = header.create({ appName: 'Exodus', appVersion: 'v1.0.0' })
  const headerBuf = header.serialize(headerObj)

  // includes a random scrypt.. may need to change
  const metadataObj = metadata.create()

  const dataToEncrypt = {
    superSecret: 'this is a secret message',
    agent: 'James Bond',
  }
  const message = Buffer.from(JSON.stringify(dataToEncrypt), 'utf8')

  const secretKey = randomBytes(32)
  const passphrase = 'open sesame'

  const { blob } = await secoBlob.encrypt(message, metadataObj, secretKey)
  await metadata.encryptBlobKey(metadataObj, passphrase, secretKey)

  const metadataBuf = metadata.serialize(metadataObj)

  const fileObj = {
    header: headerBuf,
    checksum: await file.computeChecksum(metadataBuf, blob),
    metadata: metadataBuf,
    blob,
  }

  const fileBuf = file.encode(fileObj)

  // -- DECRYPTION --

  const decFileObj = file.decode(fileBuf)
  const decTotalBuf = fileBuf.slice(header.HEADER_LEN_BYTES + 32)
  const decMetadata = metadata.decode(decFileObj.metadata)

  t.deepEqual(await scCrypto.sha256(decTotalBuf), fileObj.checksum, 'checksums equal')
  t.true(await file.checkContents(fileBuf), 'checksum is ok')

  const decSecretKey = await metadata.decryptBlobKey(decMetadata, passphrase)
  t.deepEqual(decSecretKey, secretKey, 'secret keys are the same')

  const decMessage = await secoBlob.decrypt(decFileObj.blob, decMetadata, decSecretKey)
  const decData = JSON.parse(decMessage.toString('utf8'))

  t.deepEqual(dataToEncrypt, decData, 'secret data is the same')

  t.end()
})
