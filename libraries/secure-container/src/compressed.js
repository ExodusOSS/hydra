import { decrypt, encrypt } from './index.js'
import { randomBytes, randomFill } from '@exodus/crypto/randomBytes'
import { gunzip, gzip } from '@exodus/crypto/compress'
import { utf8fromString } from '@exodus/bytes/utf8.js'

const SIZE_32K = 2 ** 15

function expand32k(data) {
  const buffer = randomBytes(data.length < SIZE_32K - 4 ? SIZE_32K : data.length + 4)
  buffer.writeUInt32BE(data.length, 0)
  data.copy(buffer, 4, 0)
  return buffer
}

function shrink32k(buffer) {
  const dataLen = buffer.readUInt32BE(0)
  return buffer.slice(4, dataLen + 4)
}

export async function encryptCompressed(
  data,
  { header, passphrase, metadata, blobKey, expandTo32k = false }
) {
  let scrub = false
  if (typeof data === 'string') {
    data = utf8fromString(data) // throws on invalid strings
    scrub = true
  } else if (!(data instanceof Uint8Array)) {
    throw new TypeError('data must be a string or an Uint8Array instance')
  }

  try {
    const gzipped = await gzip(data, { format: 'buffer' })
    try {
      const expanded = expandTo32k ? expand32k(gzipped) : gzipped
      try {
        return await encrypt(expanded, { header, passphrase, metadata, blobKey })
      } finally {
        if (expanded !== gzipped) randomFill(expanded)
      }
    } finally {
      randomFill(gzipped)
    }
  } finally {
    if (scrub) randomFill(data)
  }
}

export async function decryptCompressed(encryptedData, passphrase, { expandTo32k = false } = {}) {
  const databuffer = Buffer.from(encryptedData) // copy, destroyed later
  const { data: expanded, blobKey, metadata, header } = await decrypt(databuffer, passphrase)
  const gzipped = expandTo32k ? shrink32k(expanded) : expanded
  const result = await gunzip(gzipped, { format: 'buffer' })

  randomFill(databuffer)
  randomFill(expanded)
  if (expanded !== gzipped) randomFill(gzipped)

  return { data: result, blobKey, metadata, header }
}
