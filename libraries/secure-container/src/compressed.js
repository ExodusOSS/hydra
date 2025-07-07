import { decrypt, encrypt } from './index.js'
import { randomBytes, randomFill } from '@exodus/crypto/randomBytes'
import { gunzip, gzip } from '@exodus/crypto/compress'

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
  const databuffer = Buffer.from(data) // copy, destroyed later
  const gzipped = await gzip(databuffer, { format: 'buffer' })
  const expanded = expandTo32k ? expand32k(gzipped) : gzipped
  const result = await encrypt(expanded, { header, passphrase, metadata, blobKey })

  randomFill(databuffer)
  randomFill(gzipped)
  if (expanded !== gzipped) randomFill(expanded)

  return result
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
