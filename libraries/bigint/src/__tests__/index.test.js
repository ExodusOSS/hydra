import BN from 'bn.js'

import BNWrapper from '../bn.js'
import FeatureDetectedWrapper from '../index.js'
import NativeBigIntWrapper from '../native-bigint.js'

describe.each([
  {
    name: 'native-bigint',
    fromNumber: BigInt,
    Wrapper: NativeBigIntWrapper,
    isUnwrappedValueEqual: (a, b) => a === b,
  },
  {
    name: 'bn',
    fromNumber: (num) => new BN(num, 10),
    Wrapper: BNWrapper,
    isUnwrappedValueEqual: (a, b) => a.eq(b),
  },
])('$name', ({ Wrapper, fromNumber, isUnwrappedValueEqual }) => {
  const zero = Wrapper.wrap(0)
  const three = Wrapper.wrap(3)
  const five = Wrapper.wrap(5)

  const assertOriginalsNotMutated = () => {
    expect(isUnwrappedValueEqual(three.unwrap(), fromNumber(3))).toEqual(true)
    expect(isUnwrappedValueEqual(five.unwrap(), fromNumber(5))).toEqual(true)
  }

  describe('wrap()', () => {
    it('should wrap a number', () => {
      expect(isUnwrappedValueEqual(five.unwrap(), fromNumber(5))).toEqual(true)
    })

    it('should wrap a hexadecimal string with base 16', () => {
      const wrapped = Wrapper.wrap('a', 16)
      expect(isUnwrappedValueEqual(wrapped.unwrap(), fromNumber(10))).toEqual(true)
    })

    it('should throw for unsupported types', () => {
      expect(() => Wrapper.wrap({})).toThrow('Unsupported type: object')
    })

    it('should throw for unsupported base', () => {
      expect(() => Wrapper.wrap('a', 5)).toThrow('Unsupported base: 5')
    })
  })

  describe('add()', () => {
    it('should add two Wrapper instances', () => {
      expect(isUnwrappedValueEqual(five.add(three).unwrap(), fromNumber(8))).toEqual(true)
      assertOriginalsNotMutated()
    })
  })

  describe('mutateAdd()', () => {
    it('should add to current wrapped value', () => {
      const a = Wrapper.wrap(5)
      a.mutateAdd(Wrapper.wrap(3))
      expect(isUnwrappedValueEqual(a.unwrap(), fromNumber(8))).toEqual(true)
    })
  })

  describe('sub()', () => {
    it('should subtract one Wrapper from another', () => {
      expect(isUnwrappedValueEqual(five.sub(three).unwrap(), fromNumber(2))).toEqual(true)
      assertOriginalsNotMutated()
    })
  })

  describe('isZero()', () => {
    it('should return true for zero value', () => {
      expect(zero.isZero()).toEqual(true)
    })

    it('should return false for non-zero value', () => {
      expect(five.isZero()).toEqual(false)
    })
  })

  describe('mul()', () => {
    it('should multiply two Wrapper instances', () => {
      expect(isUnwrappedValueEqual(five.mul(three).unwrap(), fromNumber(15))).toEqual(true)
      assertOriginalsNotMutated()
    })
  })

  describe('mutateMul()', () => {
    it('should multiply to the current wrapped value', () => {
      const a = Wrapper.wrap(5)
      a.mutateMul(Wrapper.wrap(3))
      expect(isUnwrappedValueEqual(a.unwrap(), fromNumber(15))).toEqual(true)
    })
  })

  describe('div()', () => {
    it('should divide two Wrapper instances', () => {
      expect(isUnwrappedValueEqual(Wrapper.wrap(15).div(three).unwrap(), fromNumber(5))).toEqual(
        true
      )
      assertOriginalsNotMutated()
    })

    it('should divide two Wrapper instances and discard the remainder', () => {
      expect(
        isUnwrappedValueEqual(Wrapper.wrap(15).div(Wrapper.wrap(4)).unwrap(), fromNumber(3))
      ).toEqual(true)
      assertOriginalsNotMutated()
    })
  })

  describe('mutateDiv()', () => {
    it('should mutate to quotient', () => {
      const a = Wrapper.wrap(6)
      a.mutateDiv(Wrapper.wrap(3))
      expect(isUnwrappedValueEqual(a.unwrap(), fromNumber(2))).toEqual(true)
    })

    it('should discard the remainder', () => {
      const a = Wrapper.wrap(7)
      a.mutateDiv(Wrapper.wrap(3))
      expect(isUnwrappedValueEqual(a.unwrap(), fromNumber(2))).toEqual(true)
    })
  })

  describe('mod()', () => {
    it('should get the modulus of two Wrapper instances', () => {
      expect(
        isUnwrappedValueEqual(Wrapper.wrap(6).mod(Wrapper.wrap(3)).unwrap(), fromNumber(0))
      ).toEqual(true)
      expect(
        isUnwrappedValueEqual(Wrapper.wrap(7).mod(Wrapper.wrap(3)).unwrap(), fromNumber(1))
      ).toEqual(true)
      assertOriginalsNotMutated()
    })
  })

  describe('pow()', () => {
    it('should raise a Wrapper instance to the power of another', () => {
      expect(
        isUnwrappedValueEqual(Wrapper.wrap(2).pow(Wrapper.wrap(3)).unwrap(), fromNumber(8))
      ).toEqual(true)
      assertOriginalsNotMutated()
    })
  })

  describe('negate()', () => {
    it('should negate the value of a Wrapper instance', () => {
      expect(isUnwrappedValueEqual(five.negate().unwrap(), fromNumber(-5))).toEqual(true)
      expect(isUnwrappedValueEqual(Wrapper.wrap(-5).negate().unwrap(), fromNumber(5))).toEqual(true)
      assertOriginalsNotMutated()
    })
  })

  describe('mutateNegate()', () => {
    it('should negate the value of a Wrapper instance', () => {
      const a = Wrapper.wrap(5)
      a.mutateNegate()
      expect(isUnwrappedValueEqual(a.unwrap(), fromNumber(-5))).toEqual(true)

      const b = Wrapper.wrap(-5)
      b.mutateNegate()
      expect(isUnwrappedValueEqual(b.unwrap(), fromNumber(5))).toEqual(true)
    })
  })

  describe('abs()', () => {
    it('should return the absolute value of a Wrapper instance', () => {
      expect(isUnwrappedValueEqual(Wrapper.wrap(-5).abs().unwrap(), fromNumber(5))).toEqual(true)
      expect(isUnwrappedValueEqual(five.abs().unwrap(), fromNumber(5))).toEqual(true)
      assertOriginalsNotMutated()
    })
  })

  describe('mutateAbs()', () => {
    it('should return the absolute value of a Wrapper instance', () => {
      const a = Wrapper.wrap(-5)
      a.mutateAbs()
      expect(isUnwrappedValueEqual(a.unwrap(), fromNumber(5))).toEqual(true)

      const b = Wrapper.wrap(5)
      b.mutateAbs()
      expect(isUnwrappedValueEqual(b.unwrap(), fromNumber(5))).toEqual(true)
    })
  })

  describe('comparison methods', () => {
    it('should correctly compare using gte()', () => {
      expect(five.gte(three)).toEqual(true)
      expect(five.gte(Wrapper.wrap(5))).toEqual(true)
      expect(three.gte(five)).toEqual(false)
    })

    it('should correctly compare using gt()', () => {
      expect(five.gt(three)).toEqual(true)
      expect(five.gt(Wrapper.wrap(5))).toEqual(false)
      expect(three.gt(five)).toEqual(false)
    })

    it('should correctly compare using lte()', () => {
      expect(three.lte(five)).toEqual(true)
      expect(five.lte(Wrapper.wrap(5))).toEqual(true)
      expect(five.lte(three)).toEqual(false)
    })

    it('should correctly compare using lt()', () => {
      expect(three.lt(five)).toEqual(true)
      expect(five.lt(Wrapper.wrap(5))).toEqual(false)
      expect(five.lt(three)).toEqual(false)
    })

    it('should correctly compare using eq()', () => {
      expect(five.eq(Wrapper.wrap(5))).toEqual(true)
      expect(five.eq(three)).toEqual(false)
    })
  })

  describe('sign methods', () => {
    it('should correctly identify negative numbers with isNegative()', () => {
      expect(Wrapper.wrap(-5).isNegative()).toEqual(true)
      expect(five.isNegative()).toEqual(false)
      expect(zero.isNegative()).toEqual(false)
    })

    it('should correctly identify positive numbers with isPositive()', () => {
      expect(five.isPositive()).toEqual(true)
      expect(Wrapper.wrap(-5).isPositive()).toEqual(false)
      expect(zero.isPositive()).toEqual(false)
    })
  })

  describe('toString(base)', () => {
    it('should require "base" argument', () => {
      expect(() => Wrapper.wrap(15).toString()).toThrow('expected number "base"')
    })

    it('should correctly convert a Wrapper instance to a string', () => {
      expect(Wrapper.wrap(15).toString(10)).toEqual('15')
    })

    it('should correctly convert a Wrapper instance to a hex string', () => {
      expect(Wrapper.wrap(15).toString(16)).toEqual('f')
    })
  })

  describe('toNumber()', () => {
    it('should correctly convert a Wrapper instance to a number', () => {
      // false alarm, this is not a NumberUnit instance
      // eslint-disable-next-line @exodus/hydra/no-unsafe-number-unit-methods
      expect(Wrapper.wrap(15).toNumber()).toEqual(15)
    })
  })

  describe('toBaseBufferLE()', () => {
    it('should convert a Wrapper instance to little-endian buffer', () => {
      const a = Wrapper.wrap(0x12_34_56_78)
      const buffer = a.toBaseBufferLE()
      expect(buffer).toEqual(Buffer.from([0x78, 0x56, 0x34, 0x12]))
    })

    it('should convert a Wrapper instance with specified width to little-endian buffer', () => {
      const a = Wrapper.wrap(0x12_34_56_78)
      const buffer = a.toBaseBufferLE(6)
      expect(buffer).toEqual(Buffer.from([0x78, 0x56, 0x34, 0x12, 0x00, 0x00]))
    })
  })

  describe('toBaseBufferBE()', () => {
    it('should convert a Wrapper instance to big-endian buffer', () => {
      const a = Wrapper.wrap(0x12_34_56_78)
      const buffer = a.toBaseBufferBE()
      expect(buffer).toEqual(Buffer.from([0x12, 0x34, 0x56, 0x78]))
    })

    it('should convert a Wrapper instance with specified width to big-endian buffer', () => {
      const a = Wrapper.wrap(0x12_34_56_78)
      const buffer = a.toBaseBufferBE(6)
      expect(buffer).toEqual(Buffer.from([0x00, 0x00, 0x12, 0x34, 0x56, 0x78]))
    })
  })

  describe('isBigIntWrapper()', () => {
    it('should return true', () => {
      expect(Wrapper.wrap(0).isBigIntWrapper()).toEqual(true)
    })
  })
})

describe('native-bigint specifics', () => {
  it('should wrap a BigInt', () => {
    expect(NativeBigIntWrapper.wrap(5n).unwrap()).toEqual(BigInt(5))
  })
})

describe('feature detection', () => {
  it('should return the correct BigInt implementation', () => {
    if (typeof BigInt === 'function') {
      expect(FeatureDetectedWrapper).toEqual(NativeBigIntWrapper)
    } else {
      expect(FeatureDetectedWrapper).toEqual(BNWrapper)
    }
  })
})
