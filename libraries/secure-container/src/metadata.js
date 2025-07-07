import varstruct, { UInt32BE, Buffer as Buf } from 'varstruct'
import { createScryptParams, IV_LEN_BYTES, boxEncrypt, boxDecrypt } from './crypto.js'
import { vsf, CStr } from './util.js'

export const METADATA_LEN_BYTES = 256

export const struct = varstruct(
  vsf([
    [
      'scrypt',
      [
        ['salt', Buf(32)],
        ['n', UInt32BE],
        ['r', UInt32BE],
        ['p', UInt32BE],
      ],
    ],
    ['cipher', CStr(32)],
    [
      'blobKey',
      [
        ['iv', Buf(IV_LEN_BYTES)],
        ['authTag', Buf(16)],
        ['key', Buf(32)],
      ],
    ],
    [
      'blob',
      [
        ['iv', Buf(IV_LEN_BYTES)],
        ['authTag', Buf(16)],
      ],
    ],
  ])
)

export function decode(metadataBlob) {
  if (metadataBlob.byteLength > METADATA_LEN_BYTES)
    console.warn(
      `metadata greater than ${METADATA_LEN_BYTES} bytes, are you sure this is the SECO metadata?`
    )
  return struct.decode(metadataBlob)
}

export function encode(metadataObject) {
  return struct.encode(metadataObject)
}

export function serialize(metadata) {
  const buf = Buffer.alloc(METADATA_LEN_BYTES)
  encode(metadata).copy(buf)
  return buf
}

export function create(scryptParams = createScryptParams()) {
  return {
    scrypt: scryptParams,
    cipher: 'aes-256-gcm',
    blobKey: {
      iv: Buffer.alloc(IV_LEN_BYTES),
      authTag: Buffer.alloc(16),
      key: Buffer.alloc(32),
    },
    blob: {
      iv: Buffer.alloc(IV_LEN_BYTES),
      authTag: Buffer.alloc(16),
    },
  }
}

export async function encryptBlobKey(metadata, passphrase, blobKey) {
  const { authTag, blob, iv, salt } = await boxEncrypt(passphrase, blobKey, metadata.scrypt)
  // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
  metadata.scrypt.salt = salt
  // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
  metadata.blobKey = { authTag, iv, key: blob }
}

export async function decryptBlobKey(metadata, passphrase) {
  return boxDecrypt(passphrase, metadata.blobKey.key, metadata.blobKey, metadata.scrypt)
}
