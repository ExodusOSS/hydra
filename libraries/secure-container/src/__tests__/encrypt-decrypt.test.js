import { describe, test } from '@exodus/test/node'
import { readFileSync } from 'fs'
import { join } from 'path'
import { decrypt, encrypt } from 'secure-container' // eslint-disable-line import/no-extraneous-dependencies

describe('encrypt / decrypt', { concurrency: true }, () => {
  test('encrypt / decrypt', async ({ assert: t }) => {
    const secretMessage = Buffer.from('Hello, lets meet at 10 PM to plan our secret mission!')
    const passphrase = Buffer.from('opensesame', 'utf8')

    const { encryptedData } = await encrypt(secretMessage, { passphrase })

    const { data } = await decrypt(encryptedData, passphrase)

    t.equal(data.toString('utf8'), secretMessage.toString('utf8'), 'verify content is the same')
  })

  test('encrypt / decrypt (with blobkey)', async ({ assert: t }) => {
    const secretMessage = Buffer.from('Hello, lets meet at 10 PM to plan our secret mission!')
    const passphrase = Buffer.from('opensesame', 'utf8')

    const { metadata, blobKey } = await encrypt(secretMessage, { passphrase })

    const { encryptedData } = await encrypt(secretMessage, { metadata, blobKey })

    const { data } = await decrypt(encryptedData, passphrase)

    t.equal(data.toString('utf8'), secretMessage.toString('utf8'), 'verify content is the same')
  })

  test('decrypt returns valid blobKey and metadata', async ({ assert: t }) => {
    const secretMessage = Buffer.from('Hello, lets meet at 10 PM to plan our secret mission!')
    const secretMessage2 = Buffer.from('Hello, lets meet at 10 AM to plan our secret mission!')
    const passphrase = Buffer.from('opensesame', 'utf8')

    const { encryptedData } = await encrypt(secretMessage, { passphrase })

    const { data, metadata, blobKey } = await decrypt(encryptedData, passphrase)
    t.equal(data.toString('utf8'), secretMessage.toString('utf8'), 'verify content is the same')

    const { encryptedData: encryptedData2 } = await encrypt(secretMessage2, { metadata, blobKey })

    const { data: data2 } = await decrypt(encryptedData2, passphrase)
    t.equal(data2.toString('utf8'), secretMessage2.toString('utf8'), 'verify content is the same')
  })

  test('decrypt verifies checksum', async ({ assert: t }) => {
    const buf = readFileSync(join(import.meta.dirname, 'fixtures/corrupted.seco'))

    await t.rejects(
      () => decrypt(buf, 'opensesame'),
      (err) => err && /seco checksum does not match; data may be corrupted/.test(err.message),
      'should get an error'
    )
  })

  test('decrypt returns header', async ({ assert: t }) => {
    const secretMessage = Buffer.from('Hi, lets meet at 10 PM to plan our secret mission!', 'utf8')
    const passphrase = Buffer.from('opensesame')
    const header = {
      appName: 'test',
      appVersion: '1.0.0',
    }

    const { encryptedData } = await encrypt(secretMessage, { passphrase, header })

    const result = await decrypt(encryptedData, passphrase)

    t.strictEqual(result.header.appName, header.appName, 'appName is returned')
    t.strictEqual(result.header.appVersion, header.appVersion, 'appVersion is returned')
  })
})
