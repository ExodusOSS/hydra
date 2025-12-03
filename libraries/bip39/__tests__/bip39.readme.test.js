// From https://www.npmjs.com/package/bip39, ISC
// Changed for API

import { mock, test } from '@exodus/test/node'

mock.module('@exodus/crypto/randomBytes', {
  namedExports: {
    randomBytes: jest.fn(),
  },
})

const { randomBytes } = await import('@exodus/crypto/randomBytes')
const bip39 = await import('@exodus/bip39') // eslint-disable-line import/no-extraneous-dependencies

test('README example 1', async (c) => {
  // defaults to BIP39 English word list
  const entropy = Buffer.from('ffffffffffffffffffffffffffffffff', 'hex')
  const mnemonic = await bip39.entropyToMnemonic({ entropy })

  c.plan(2)
  c.assert.equal(mnemonic, 'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong')

  // reversible
  c.assert.deepEqual(await bip39.mnemonicToEntropy({ mnemonic, format: 'buffer' }), entropy)
})

test('README example 2', async (c) => {
  c.plan(3)

  randomBytes.mockImplementationOnce((size) => {
    c.assert.equal(size, 128 / 8)
    const entropy = Buffer.from('qwertyuiopasdfghjklzxcvbnm[];,./'.slice(0, size), 'utf8')
    return entropy.subarray(0, size)
  })

  const mnemonic = await bip39.generateMnemonic({ bitsize: 128 })

  c.assert.equal(
    mnemonic,
    'imitate robot frame trophy nuclear regret saddle around inflict case oil spice'
  )
  c.assert.equal(await bip39.mnemonicIsInvalid({ mnemonic }), false)
})

test('README example 3', async (c) => {
  const mnemonic = 'basket actual'
  const seed = await bip39.mnemonicToSeed({ mnemonic, format: 'hex', validate: false })

  c.plan(2)
  c.assert.equal(
    seed.toString('hex'),
    '5cf2d4a8b0355e90295bdfc565a022a409af063d5365bb57bf74d9528f494bfa4400f53d8349b80fdae44082d7f9541e1dba2b003bcfec9d0d53781ca676651f'
  )
  c.assert.equal(await bip39.mnemonicIsInvalid({ mnemonic }), true)
})
