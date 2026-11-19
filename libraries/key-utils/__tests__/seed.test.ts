import { mnemonicToSeed } from '@exodus/bip39'

import { getSeedId } from '../src/index.js'

describe('getSeedId', async () => {
  const mnemonic = 'cousin access oak tragic entire dynamic marine expand govern enjoy honey tissue'
  const seed = await mnemonicToSeed({ mnemonic })

  test('returns hex encoded seed id', async () => {
    expect(await getSeedId(seed)).toBe('69c0aafcbc21f299e0205ee8cfd8619cefebbf0c')
  })
})
