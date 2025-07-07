import test from '@exodus/test/tape'
import _aw from 'aw'
import fs from 'fs-extra'
import path from 'path'

import { read as readFile, write as writeFile } from './seco-file.js'

const aw = _aw({ injectCallback: false })
const testDir = path.join('/tmp', 'test', 'seco-file-read-file')

test('readFile w/ string passphrase', async (t) => {
  const testFile = path.join(testDir, 'secret.bin')
  fs.emptyDirSync(testDir)

  const secretMessage = Buffer.from('Hello, lets meet at 10 PM to plan our secret mission!', 'utf8')
  const passphrase = 'opensesame'

  const [writeFileErr] = await aw(writeFile)(testFile, secretMessage, {
    passphrase,
    overwrite: true,
  })
  t.ifError(writeFileErr, 'no error')

  const [readFileErr, readFileRes] = await aw(readFile)(testFile, passphrase)
  t.ifError(readFileErr, 'no error on read')

  t.is(
    readFileRes.data.toString('utf8'),
    secretMessage.toString('utf8'),
    'verify content is the same'
  )
  t.assert(Buffer.isBuffer(readFileRes.blobKey))
  t.is(typeof readFileRes.metadata, 'object')

  t.end()
})

test('readFile verifies checksum', async (t) => {
  const testFile = path.resolve(import.meta.dirname, '../fixtures/corrupted.seco')

  const [err] = await aw(readFile)(testFile, 'opensesame')

  t.assert(err)
  t.ok(err.message.includes(testFile))
  t.ok(err.message.match(/seco checksum does not match; file may be corrupted/))
  t.end()
})

test('readFile returns header', async (t) => {
  const testFile = path.join(testDir, 'secret.bin')
  fs.emptyDirSync(testDir)

  const secretMessage = Buffer.from('Hi, lets meet at 10 PM to plan our secret mission!', 'utf8')
  const passphrase = Buffer.from('opensesame')
  const header = {
    appName: 'test',
    appVersion: '1.0.0',
  }

  const [writeFileErr] = await aw(writeFile)(testFile, secretMessage, {
    passphrase,
    overwrite: true,
    header,
  })
  t.ifError(writeFileErr, 'no error')

  const [readFileErr, readFileRes] = await aw(readFile)(testFile, passphrase)
  t.ifError(readFileErr, 'no error on read')

  t.is(readFileRes.header.appName, header.appName, 'appName is returned')
  t.is(readFileRes.header.appVersion, header.appVersion, 'appVersion is returned')

  t.end()
})
