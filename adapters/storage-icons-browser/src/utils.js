import { gunzip } from 'zlib'
import { cleanup } from '@exodus/svg-safe'

export const unzipIcon = async (base64) => {
  const buff = Buffer.from(base64, 'base64')
  const unzip = await new Promise((resolve, reject) => {
    gunzip(buff, (err, res) => {
      if (err) {
        reject(err)
        return
      }

      resolve(res)
    })
  })
  return cleanup(unzip.toString('utf8'))
}
