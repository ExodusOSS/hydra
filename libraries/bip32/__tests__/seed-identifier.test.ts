import { fromMasterSeed } from '../src/index.js'

test('seed identifier', () => {
  // source: https://github.com/bitcoinjs/bip32/blob/efe4d50c120f2e3d15b4b493e2c4d5fd09dee4ee/test/fixtures/index.json#L94-L101C24
  const wrapper = fromMasterSeed(
    Buffer.from(
      'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542',
      'hex'
    )
  )

  expect(wrapper.identifier).toEqual(Buffer.from('bd16bee53961a47d6ad888e29545434a89bdfe95', 'hex'))
})
