import fs from 'fs-extra'
import { decrypt, encrypt } from 'secure-container' // eslint-disable-line import/no-extraneous-dependencies

// options: passphrase, blobKey, metdata, overwrite
export async function write(file, data, options = {}) {
  options = { overwrite: false, ...options }

  if (!options.overwrite && (await fs.pathExists(file)))
    throw new Error(`${file} exists. Set 'overwrite' to true.`)

  const { encryptedData, blobKey, metadata } = await encrypt(data, options)

  await fs.outputFile(file, encryptedData)

  return { blobKey, metadata }
}

export async function read(file, passphrase) {
  const fileData = await fs.readFile(file)

  let result
  try {
    result = await decrypt(fileData, passphrase)
  } catch (e) {
    if (/seco checksum does not match; data may be corrupted/u.test(e.message)) {
      throw new Error(`${file}: seco checksum does not match; file may be corrupted`)
    }

    throw e
  }

  return result
}
