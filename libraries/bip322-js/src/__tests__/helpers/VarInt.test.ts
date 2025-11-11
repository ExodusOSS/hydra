// Import module to be tested
import VarInt from '../src/helpers/VarInt.js'

describe('VarInt Test', () => {
  it('Encode numebr into VarInt correctly', () => {
    expect(VarInt.encode(0x00)).toStrictEqual(Buffer.from([0x00]))
    expect(VarInt.encode(0xf0)).toStrictEqual(Buffer.from([0xf0]))
    expect(VarInt.encode(0xfd)).toStrictEqual(Buffer.from([0xfd, 0xfd, 0x00]))
    expect(VarInt.encode(0xff_00)).toStrictEqual(Buffer.from([0xfd, 0x00, 0xff]))
    expect(VarInt.encode(0xff_ff)).toStrictEqual(Buffer.from([0xfd, 0xff, 0xff]))
    expect(VarInt.encode(0x1_00_00)).toStrictEqual(Buffer.from([0xfe, 0x00, 0x00, 0x01, 0x00]))
    expect(VarInt.encode(0xff_ff_00_00)).toStrictEqual(Buffer.from([0xfe, 0x00, 0x00, 0xff, 0xff]))
    expect(VarInt.encode(0xff_ff_ff_ff)).toStrictEqual(Buffer.from([0xfe, 0xff, 0xff, 0xff, 0xff]))
    expect(VarInt.encode(0x1_00_00_00_00)).toStrictEqual(
      Buffer.from([0xff, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00])
    )
    expect(VarInt.encode(0x00_00_ff_ff_00_00_00_00)).toStrictEqual(
      Buffer.from([0xff, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00])
    )
    expect(VarInt.encode.bind(0x1_00_00_00_00_00_00)).toThrow(/Integer too large: /)
  })

  it('Decode VarInt into number correctly', () => {
    expect(VarInt.decode(Buffer.from([0x00]))).toStrictEqual(0x00)
    expect(VarInt.decode(Buffer.from([0xf0]))).toStrictEqual(0xf0)
    expect(VarInt.decode(Buffer.from([0xfd, 0xfd, 0x00]))).toStrictEqual(0xfd)
    expect(VarInt.decode(Buffer.from([0xfd, 0x00, 0xff]))).toStrictEqual(0xff_00)
    expect(VarInt.decode(Buffer.from([0xfd, 0xff, 0xff]))).toStrictEqual(0xff_ff)
    expect(VarInt.decode(Buffer.from([0xfe, 0x00, 0x00, 0x01, 0x00]))).toStrictEqual(0x1_00_00)
    expect(VarInt.decode(Buffer.from([0xfe, 0x00, 0x00, 0xff, 0xff]))).toStrictEqual(0xff_ff_00_00)
    expect(VarInt.decode(Buffer.from([0xfe, 0xff, 0xff, 0xff, 0xff]))).toStrictEqual(0xff_ff_ff_ff)
    expect(
      VarInt.decode(Buffer.from([0xff, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]))
    ).toStrictEqual(0x1_00_00_00_00)
    expect(
      VarInt.decode(Buffer.from([0xff, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00]))
    ).toStrictEqual(0x00_00_ff_ff_00_00_00_00)
  })

  it('Throw when encoding an empty Buffer', () => {
    expect(VarInt.decode.bind(VarInt, Buffer.alloc(0))).toThrow('Empty buffer provided')
  })
})
