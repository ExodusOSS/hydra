import * as scCrypto from './crypto.js'

export async function encrypt(message, metadata, blobKey) {
  const { authTag, iv, blob } = await scCrypto.aesEncrypt(blobKey, message)
  // oxlint-disable-next-line @exodus/oxlint-plugin-hydra/no-param-reassign-prop-only
  metadata.blob = { authTag, iv }
  return { blob, blobKey }
}

export async function decrypt(blob, metadata, blobKey) {
  return scCrypto.aesDecrypt(blobKey, blob, metadata.blob)
}
