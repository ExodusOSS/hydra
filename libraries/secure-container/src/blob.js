import * as scCrypto from './crypto.js'

export async function encrypt(message, metadata, blobKey) {
  const { authTag, iv, blob } = await scCrypto.aesEncrypt(blobKey, message)
  // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
  metadata.blob = { authTag, iv }
  return { blob, blobKey }
}

export async function decrypt(blob, metadata, blobKey) {
  return scCrypto.aesDecrypt(blobKey, blob, metadata.blob)
}
