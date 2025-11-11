// Import test data
// Import module to be tested
import { decodeScriptSignature } from '../src/bitcoinjs/DecodeScriptSignature.js'
import fixtures from './signature.cjs'

// Test copied from https://github.com/bitcoinjs/bitcoinjs-lib/blob/5d2ff1c61165932e2814d5f37630e6720168561c/test/script_signature.spec.ts
describe('Decode Script Signatures', () => {
  function toRaw(signature) {
    return {
      r: signature.slice(0, 32).toString('hex'),
      s: signature.slice(32, 64).toString('hex'),
    }
  }

  fixtures.valid.forEach((f) => {
    it('Decodes ' + f.hex, () => {
      const decode = decodeScriptSignature(Buffer.from(f.hex, 'hex'))
      expect(toRaw(decode.signature)).toStrictEqual(f.raw)
      expect(decode.hashType).toStrictEqual(f.hashType)
    })
  })

  fixtures.invalid.forEach((f) => {
    it('Throws on ' + f.hex, () => {
      const buffer = Buffer.from(f.hex, 'hex')
      expect(decodeScriptSignature.bind(decodeScriptSignature, buffer)).toThrow(
        new RegExp(f.exception)
      )
    })
  })
})
