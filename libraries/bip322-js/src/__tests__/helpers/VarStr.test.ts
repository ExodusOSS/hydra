// Import module to be tested
import VarStr from '../src/helpers/VarStr.js'

describe('VarStr Test', () => {
  it('Encode and decode VarStr correctly', () => {
    const toEncode = 'Hello World'
    const toEncodeBuffer = Buffer.from(toEncode, 'ascii')
    const encodedVarStr = VarStr.encode(toEncodeBuffer)
    expect(encodedVarStr).toStrictEqual(Buffer.from([toEncode.length, ...toEncodeBuffer]))
    const decodedStr = VarStr.decode(encodedVarStr).toString('ascii')
    expect(decodedStr).toStrictEqual(toEncode)
  })

  it('Encode and decode multiple VarStr within the same buffer correctly', () => {
    const toEncode = 'Hello World'
    const toEncodeBuffer = Buffer.from(toEncode, 'ascii')
    const encodedVarStrX2 = Buffer.concat([
      VarStr.encode(toEncodeBuffer),
      VarStr.encode(toEncodeBuffer),
    ]) // Encode the string twice
    const decodedStr = VarStr.decode(encodedVarStrX2).toString('ascii')
    expect(decodedStr).toStrictEqual(toEncode) // Should still work
  })
})
