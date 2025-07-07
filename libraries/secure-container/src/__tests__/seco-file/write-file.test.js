import test from '@exodus/test/tape'
import _aw from 'aw'
import fs from 'fs-extra'
import path from 'path'

import { write as writeFile } from './seco-file.js'

const aw = _aw({ injectCallback: false })
const testDir = path.join('/tmp', 'test', 'seco-file-write-file')

test('writeFile (overwrite == default)', async (t) => {
  const testFile = path.join(testDir, 'secret.bin')
  fs.emptyDirSync(testDir)

  const secretMessage = Buffer.from('Hello, lets meet at 10 PM to plan our secret mission!', 'utf8')
  const passphrase = Buffer.from('opensesame', 'utf8')

  // ensure file exists
  fs.outputFileSync(testFile, 'does not matter')

  const [writeFileErr] = await aw(writeFile)(testFile, secretMessage, { passphrase })
  t.true(writeFileErr.message.match(/exists/))

  t.end()
})

test('writeFile (overwrite == false)', async (t) => {
  const testFile = path.join(testDir, 'secret.bin')
  fs.emptyDirSync(testDir)

  const secretMessage = Buffer.from('Hello, lets meet at 10 PM to plan our secret mission!', 'utf8')
  const passphrase = Buffer.from('opensesame', 'utf8')

  // ensure file exists
  fs.outputFileSync(testFile, 'does not matter')

  const [writeFileErr] = await aw(writeFile)(testFile, secretMessage, {
    passphrase,
    overwrite: false,
  })
  t.true(writeFileErr.message.match(/exists/))

  t.end()
})

test('writeFile (overwrite == true)', async (t) => {
  const testFile = path.join(testDir, 'secret.bin')
  fs.emptyDirSync(testDir)

  const secretMessage = Buffer.from('Hello, lets meet at 10 PM to plan our secret mission!', 'utf8')
  const passphrase = Buffer.from('opensesame', 'utf8')

  // ensure file exists
  fs.outputFileSync(testFile, 'does not matter')

  const [writeFileErr] = await aw(writeFile)(testFile, secretMessage, {
    passphrase,
    overwrite: true,
  })
  t.ifError(writeFileErr, 'no error')

  t.end()
})
