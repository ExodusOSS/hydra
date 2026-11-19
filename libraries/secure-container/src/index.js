import { randomBytes, randomFill } from '@exodus/crypto/randomBytes'
import * as conBlob from './blob.js'
import * as conHeader from './header.js'
import * as conMetadata from './metadata.js'
import * as conFile from './file.js'
import { utf8fromString } from '@exodus/bytes/utf8.js'

// options: passphrase, blobKey, metdata
export async function encrypt(data, options = {}) {
  if (!options.header) console.warn('seco: should pass options.header.')
  const header = conHeader.create(options.header)

  let blobKey
  let metadata
  if (options.passphrase) {
    blobKey = randomBytes(32)
    metadata = conMetadata.create()
    await conMetadata.encryptBlobKey(metadata, options.passphrase, blobKey)
  } else if (options.metadata && options.blobKey) {
    blobKey = options.blobKey
    metadata = options.metadata
  } else {
    throw new Error('Must set either passphrase or (metadata and blobKey)')
  }

  let scrub = false
  if (typeof data === 'string') {
    data = utf8fromString(data) // throws on invalid strings
    scrub = true
  } else if (!(data instanceof Uint8Array)) {
    throw new TypeError('data must be a string or an Uint8Array instance')
  }

  let enc
  try {
    enc = await conBlob.encrypt(data, metadata, blobKey)
  } finally {
    if (scrub) randomFill(data)
  }

  const headerBuf = conHeader.serialize(header)
  const mdBuf = conMetadata.serialize(metadata)

  const fileObj = {
    header: headerBuf,
    checksum: await conFile.computeChecksum(mdBuf, enc.blob),
    metadata: mdBuf,
    blob: enc.blob,
  }
  const encryptedData = conFile.encode(fileObj)

  return { encryptedData, blobKey, metadata }
}

export async function decrypt(encryptedData, passphrase) {
  const fileObj = conFile.decode(encryptedData)

  const checksum = await conFile.computeChecksum(fileObj.metadata, fileObj.blob)
  if (!fileObj.checksum.equals(checksum)) {
    throw new Error('seco checksum does not match; data may be corrupted')
  }

  const metadata = conMetadata.decode(fileObj.metadata)
  const blobKey = await conMetadata.decryptBlobKey(metadata, passphrase)
  const header = conHeader.decode(fileObj.header)
  const data = await conBlob.decrypt(fileObj.blob, metadata, blobKey)

  return { data, blobKey, metadata, header }
}

export * as blob from './blob.js'
export * as metadata from './metadata.js'
export * as header from './header.js'
export * as file from './file.js'
