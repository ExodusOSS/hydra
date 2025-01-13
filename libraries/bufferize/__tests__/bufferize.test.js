import bufferize from '../index.js'

describe('bufferize', () => {
  test('convert Uint8Array to buffer', () => {
    const uint8 = new Uint8Array(2)
    uint8[0] = 42

    expect(
      bufferize({
        someProp: uint8,
      }).someProp
    ).toEqual(Buffer.from(uint8))
  })
})
