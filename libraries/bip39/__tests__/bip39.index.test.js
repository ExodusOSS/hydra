// From https://www.npmjs.com/package/bip39, ISC
// Changed for API

import * as bip39 from '@exodus/bip39' // eslint-disable-line import/no-extraneous-dependencies
import english from '@exodus/bip39/wordlists/english' // eslint-disable-line import/no-extraneous-dependencies
import { test } from '@exodus/test/tape'
// our eslint config breaks on json imports, so we do this
import { readFileSync } from 'fs'
import { resolve } from 'path'

import japanese from './wordlists/japanese.js'

const custom = JSON.parse(readFileSync(resolve(import.meta.dirname, 'wordlist.json')))
const vectors = JSON.parse(readFileSync(resolve(import.meta.dirname, 'vectors.json')))

const WORDLISTS = { english, japanese, custom }

function testVector(description, wordlist, password, v, i) {
  const [ventropy, vmnemonic, vseedHex] = v

  test('for ' + description + '(' + i + '), ' + ventropy, async (t) => {
    t.plan(5)

    t.equal(
      await bip39.mnemonicToEntropy({ mnemonic: vmnemonic, wordlist, format: 'hex' }),
      ventropy,
      'mnemonicToEntropy returns ' + ventropy.slice(0, 40) + '...'
    )
    t.equal(
      await bip39.mnemonicToSeed({ mnemonic: vmnemonic, password, format: 'hex', wordlist }),
      vseedHex,
      'mnemonicToSeed returns ' + vseedHex.slice(0, 40) + '...'
    )
    t.equal(
      await bip39.mnemonicToSeed({ mnemonic: vmnemonic, password, format: 'hex', validate: false }),
      vseedHex,
      'mnemonicToSeed returns ' + vseedHex.slice(0, 40) + '...'
    )
    t.equal(
      await bip39.entropyToMnemonic({ entropy: Buffer.from(ventropy, 'hex'), wordlist }),
      vmnemonic,
      'entropyToMnemonic returns ' + vmnemonic.slice(0, 40) + '...'
    )
    t.equal(
      await bip39.mnemonicIsInvalid({ mnemonic: vmnemonic, wordlist }),
      false,
      'mnemonicIsInvalid returns false'
    )
  })
}

vectors.english.forEach(function (v, i) {
  testVector('English', undefined, 'TREZOR', v, i)
})
vectors.japanese.forEach(function (v, i) {
  testVector('Japanese', WORDLISTS.japanese, '㍍ガバヴァぱばぐゞちぢ十人十色', v, i)
})
vectors.custom.forEach(function (v, i) {
  testVector('Custom', WORDLISTS.custom, undefined, v, i)
})

test('invalid entropy', async (t) => {
  t.plan(3)

  await t.rejects(
    () => bip39.entropyToMnemonic({ entropy: Buffer.from('', 'hex') }),
    /^Error: Invalid entropy size$/,
    'throws for empty entropy'
  )

  await t.rejects(
    () => bip39.entropyToMnemonic({ entropy: Buffer.from('000000', 'hex') }),
    /^Error: Invalid entropy size$/,
    "throws for entropy that's not a multitude of 4 bytes"
  )

  await t.rejects(
    () =>
      bip39.entropyToMnemonic({
        entropy: Buffer.from(Array.from({ length: 1028 + 1 }).join('00'), 'hex'),
      }),
    /^Error: Invalid entropy size$/,
    'throws for entropy that is larger than 1024'
  )
})

test('UTF8 passwords', async (t) => {
  t.plan(vectors.japanese.length * 2)

  for (const v of vectors.japanese) {
    const vmnemonic = v[1]
    const vseedHex = v[2]

    const password = '㍍ガバヴァぱばぐゞちぢ十人十色'
    const normalizedPassword = 'メートルガバヴァぱばぐゞちぢ十人十色'

    t.equal(
      await bip39.mnemonicToSeed({
        mnemonic: vmnemonic,
        password,
        wordlist: japanese,
        format: 'hex',
      }),
      vseedHex,
      'mnemonicToSeed normalizes passwords'
    )
    t.equal(
      await bip39.mnemonicToSeed({
        mnemonic: vmnemonic,
        password: normalizedPassword,
        wordlist: japanese,
        format: 'hex',
      }),
      vseedHex,
      'mnemonicToSeed leaves normalizes passwords as-is'
    )
  }
})

test('generateMnemonic can vary entropy length', async (t) => {
  const mnemonic = await bip39.generateMnemonic({ bitsize: 160 })
  const words = mnemonic.split(' ')

  t.plan(1)
  t.equal(words.length, 15, 'can vary generated entropy bit length')
})

test('mnemonicIsInvalid', async (t) => {
  t.plan(5)

  t.equal(
    await bip39.mnemonicIsInvalid('sleep kitten'),
    true,
    'fails for a mnemonic that is too short'
  )
  t.equal(
    await bip39.mnemonicIsInvalid('sleep kitten sleep kitten sleep kitten'),
    true,
    'fails for a mnemonic that is too short'
  )
  t.equal(
    await bip39.mnemonicIsInvalid(
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about end grace oxygen maze bright face loan ticket trial leg cruel lizard bread worry reject journey perfect chef section caught neither install industry'
    ),
    true,
    'fails for a mnemonic that is too long'
  )
  t.equal(
    await bip39.mnemonicIsInvalid(
      'turtle front uncle idea crush write shrug there lottery flower risky shell'
    ),
    true,
    'fails if mnemonic words are not in the word list'
  )
  t.equal(
    await bip39.mnemonicIsInvalid(
      'sleep kitten sleep kitten sleep kitten sleep kitten sleep kitten sleep kitten'
    ),
    true,
    'fails for invalid checksum'
  )
})
