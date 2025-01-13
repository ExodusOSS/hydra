import deprecationWarning from './deprecation-warning.js'
import BigIntWrapper from '@exodus/bigint'

function isMaybeBN(num) {
  const BNwordSize = 26 // always have been
  return (
    num !== null &&
    typeof num === 'object' &&
    num.constructor.wordSize === BNwordSize &&
    Array.isArray(num.words)
  )
}

export function createNumber(num, power) {
  if (num.isBigIntWrapper?.()) {
    return num
  }

  if (isMaybeBN(num) && power > 0) {
    // throwing error because this convo truncated zeros incorrectly.
    throw new Error(
      `You are creating a NU providing a BN.js number ${num} with a power of ${power}. Please use base units, string or decimal numbers!`
    )
  }

  if (typeof num === 'bigint' && power > 0) {
    // this convo is controversial for some devs. Better not to use it.
    deprecationWarning(
      `You are creating a NU providing a bigint number ${num} with a power of ${power}. Please use base unit, string or decimal numbers!`
    )
  }

  if (BigIntWrapper.isUnderlyingInstance(num)) {
    const wrapped = BigIntWrapper.wrap(num)
    return power
      ? wrapped.mutateMul(BigIntWrapper.wrap(10).pow(BigIntWrapper.wrap(power)))
      : wrapped
  }

  const value = stringToNumberFraction(num, power, { numberOnly: true })
  return BigIntWrapper.wrap(value)
}

export function stringToNumberFraction(num, exp, { numberOnly = false } = {}) {
  if (typeof num === 'number') {
    if (num === Number.POSITIVE_INFINITY || num === Number.NEGATIVE_INFINITY)
      throw new Error('Infinity is not supported')
    num = num.toString()
  } else if (typeof num === 'string') {
    num = num.toLowerCase()
  } else if (isMaybeBN(num)) {
    num = num.toString()
  } else if (typeof num === 'bigint') {
    num = num.toString()
  } else {
    throw new TypeError(`Invalid number type '${typeof num}'`)
  }

  // 0x means hex number, can be only positive without fraction?
  if (num.length > 2 && num[0] === '0' && num[1] === 'x') {
    // need validate, because BN do not have it
    num = num.slice(2)
    if (!/^[\d.a-f]*$/.test(num)) {
      throw new Error(`Invalid hex number: 0x${num}`)
    }

    num = BigIntWrapper.wrap(num, 16).toString(10)
  }

  // create negative flag and remove symbol from num
  const isNeg = num[0] === '-'
  if (isNeg) {
    num = num.slice(1)
  }

  const firstSymbol = isNeg ? '-' : ''

  // remove extra plus symbol (-+ not allowed)
  if (num[0] === '+' && !isNeg) {
    num = num.slice(1)
  }

  // remove exponential from num and adjust exp
  const ep = num.indexOf('e')
  if (ep !== -1) {
    exp += Number.parseInt(num.slice(ep + 1), 10)
    if (Number.isNaN(exp)) {
      throw new TypeError(`Invalid exponential in number: ${num}`)
    }

    num = num.slice(0, ep)
  }

  // verify that there no extra symbols, only `0-9` and one `.` allowed
  if (!/^\d*(\.\d*)?$/.test(num)) {
    throw new Error(`Not allowed symbol in number: ${num}`)
  }

  // add point in case if num do not have it
  // add extra zero if first or last symbol is a point
  const pp = num.indexOf('.')
  switch (pp) {
    case -1: {
      num += '.0'

      break
    }

    case 0: {
      num = '0' + num

      break
    }

    case num.length - 1: {
      num += '0'

      break
    }
    // No default
  }

  if (exp === 0) {
    const npp = num.indexOf('.')

    const number = firstSymbol + num.slice(0, npp)
    if (numberOnly) return number

    const fraction = num.slice(npp + 1)
    return { number, fraction: firstSymbol + fraction, fractionLength: fraction.length }
  }

  // add extra zeros
  if (exp > 0) {
    num = num.padEnd(num.length + exp, '0')
  } else {
    num = num.padStart(num.length - exp, '0')
  }

  // cut point symbol
  const npp = num.indexOf('.')
  num = num.slice(0, npp) + num.slice(npp + 1)

  const number = firstSymbol + num.slice(0, npp + exp)
  if (numberOnly) return number

  let fraction = num.slice(npp + exp)
  let zp = fraction.length - 1
  while (fraction[zp] === '0' && zp > 0) zp -= 1
  // cut tail zeros
  if (zp !== fraction.length - 1) {
    fraction = fraction.slice(0, zp + 1)
  }

  return { number, fraction: firstSymbol + fraction, fractionLength: fraction.length }
}
