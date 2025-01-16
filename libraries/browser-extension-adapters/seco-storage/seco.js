import createExpander from 'buffer-noise'
import { decrypt as _decrypt, encrypt as _encrypt } from 'secure-container'
import { gunzipSync, gzipSync } from 'zlib'

const { expand: expand32k, shrink: shrink32k } = createExpander(Math.pow(2, 15))

export const encryptString = ({ data, key, encoding = 'base64', appVersion }) => {
  const header = { appName: 'Exodus', appVersion }

  try {
    const databuffer = Buffer.from(data)

    const gzipped = gzipSync(databuffer)
    const expanded = expand32k(gzipped)
    const { encryptedData } = _encrypt(expanded, { header, passphrase: key })

    globalThis.crypto.getRandomValues(databuffer)
    globalThis.crypto.getRandomValues(gzipped)
    globalThis.crypto.getRandomValues(expanded)

    return encryptedData.toString(encoding)
  } catch {
    throw new Error('Unable to encrypt data')
  }
}

export const decryptString = ({ data, key, encoding = 'base64' }) => {
  try {
    const databuffer = Buffer.from(data, encoding)

    const expanded = _decrypt(databuffer, key)
    const gzipped = shrink32k(expanded.data)
    const result = gunzipSync(gzipped)

    globalThis.crypto.getRandomValues(databuffer)
    globalThis.crypto.getRandomValues(expanded.data)
    globalThis.crypto.getRandomValues(gzipped)

    return result.toString()
  } catch {
    throw new Error('Unable to decrypt data')
  }
}
