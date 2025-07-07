import varstruct, { Buffer as Buf, VarBuffer, UInt32BE } from 'varstruct'
import { fromUInt32BE } from './buffer.js'
import * as scCrypto from './crypto.js'
import { vsf } from './util.js'

import { HEADER_LEN_BYTES } from './header.js'
import { METADATA_LEN_BYTES } from './metadata.js'

export const struct = varstruct(
  vsf([
    ['header', Buf(HEADER_LEN_BYTES)],
    ['checksum', Buf(32)],
    ['metadata', Buf(METADATA_LEN_BYTES)],
    ['blob', VarBuffer(UInt32BE)],
  ])
)

export function decode(fileContents) {
  return struct.decode(fileContents)
}

export function encode(fileContents) {
  return struct.encode(fileContents)
}

export async function computeChecksum(metadata, blob) {
  return scCrypto.sha256(Buffer.concat([metadata, fromUInt32BE(blob.byteLength), blob]))
}

export async function checkContents(fileContents) {
  const fileObj = decode(fileContents)
  return fileObj.checksum.equals(await computeChecksum(fileObj.metadata, fileObj.blob))
}
