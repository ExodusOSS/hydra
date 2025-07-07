import { mnemonicToSeedSync } from 'bip39'

import { getSeedId } from '../src/index.js'

describe('getSeedId', () => {
  const mnemonic = 'cousin access oak tragic entire dynamic marine expand govern enjoy honey tissue'
  const seed = mnemonicToSeedSync(mnemonic)

  test('returns hex encoded seed id', () => {
    expect(getSeedId(seed)).toBe('69c0aafcbc21f299e0205ee8cfd8619cefebbf0c')
  })
})
